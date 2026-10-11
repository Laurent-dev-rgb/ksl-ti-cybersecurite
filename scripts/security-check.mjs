import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules']);
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files = await walk(root);
const htmlFiles = files.filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');

  if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    failures.push(`${rel}: script inline détecté`);
  }
  if (/\sstyle\s*=\s*["'][^"']*["']/i.test(html)) {
    failures.push(`${rel}: style inline détecté`);
  }
  if (/http:\/\//i.test(html)) {
    failures.push(`${rel}: lien HTTP non chiffré détecté`);
  }

  const blankLinks = [...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)];
  for (const match of blankLinks) {
    if (!/\brel=["'][^"']*noopener[^"']*["']/i.test(match[0])) {
      failures.push(`${rel}: target="_blank" sans rel="noopener"`);
      break;
    }
  }
}

const netlify = await readFile(path.join(root, 'netlify.toml'), 'utf8');
const requiredHeaders = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
  'Content-Security-Policy'
];

for (const header of requiredHeaders) {
  if (!netlify.includes(header)) failures.push(`netlify.toml: en-tête manquant — ${header}`);
}

const cspLine = netlify.split(/\r?\n/).find(line => line.includes('Content-Security-Policy')) || '';
if (/script-src[^;]*'unsafe-inline'/.test(cspLine)) failures.push('CSP: unsafe-inline interdit dans script-src');
if (/style-src[^;]*'unsafe-inline'/.test(cspLine)) failures.push('CSP: unsafe-inline interdit dans style-src');

if (failures.length) {
  console.error('\nÉchec du contrôle de sécurité KSL :');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}

console.log(`Contrôle de sécurité KSL réussi — ${htmlFiles.length} pages HTML vérifiées.`);
