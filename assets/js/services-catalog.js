import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://rgffoijcimsdesezjksi.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_h9CaN2YQ5lYXlfqBGT2ofA_ematARSs'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const grid = document.querySelector('#dynamic-services')
const filters = document.querySelector('#service-filters')
let services = []
let activeFilter = ''

const labels = {
  ti: 'TI',
  cybersecurite: 'Cybersécurité',
  developpement: 'Développement',
  entreprises: 'Services aux entreprises',
  entretien: 'Entretien'
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[char])
}

function render() {
  const visible = services.filter(service => !activeFilter || service.division === activeFilter)
  if (!visible.length) {
    grid.innerHTML = '<div class="notice">Aucun service n’est publié dans cette catégorie.</div>'
    return
  }

  grid.innerHTML = visible.map(service => `
    <article class="enterprise-card reveal">
      <div class="icon-box">${escapeHtml(service.icon || '•')}</div>
      <span class="tag">${escapeHtml(labels[service.division] || service.division)}</span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.summary)}</p>
      <ul>${(service.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      ${service.authorization_note ? `<div class="service-warning">${escapeHtml(service.authorization_note)}</div>` : ''}
    </article>
  `).join('')
}

async function load() {
  const { data, error } = await supabase
    .from('service_catalog')
    .select('id,title,division,icon,summary,items,sort_order,authorization_note')
    .eq('is_active', true)
    .eq('show_on_ti', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(error)
    grid.innerHTML = '<div class="notice">Le catalogue est temporairement indisponible. Veuillez communiquer avec KSL.</div>'
    return
  }

  services = data || []
  render()
}

filters?.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]')
  if (!button) return
  activeFilter = button.dataset.filter
  filters.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === button))
  render()
})

load()
