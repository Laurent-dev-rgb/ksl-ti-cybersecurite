const SUPABASE_URL = 'https://rgffoijcimsdesezjksi.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_h9CaN2YQ5lYXlfqBGT2ofA_ematARSs'
const FALLBACK_SERVICES = [{"title": "Consultation informatique", "division": "ti", "icon": "🧭", "summary": "Diagnostic, conseils et modernisation technologique pour les PME.", "items": ["Diagnostic informatique", "Conseils technologiques", "Transformation numérique", "Modernisation des PME"], "sort_order": 1}, {"title": "Support informatique", "division": "ti", "icon": "🎧", "summary": "Assistance à distance ou sur place pour les utilisateurs et les postes de travail.", "items": ["Assistance à distance", "Assistance sur place", "Dépannage Windows", "Dépannage Mac", "Installation de logiciels", "Configuration d’imprimantes", "Migration de postes", "Optimisation des ordinateurs", "Sauvegardes"], "sort_order": 2}, {"title": "Réseaux", "division": "ti", "icon": "🌐", "summary": "Installation, configuration, sécurisation et analyse des réseaux d’entreprise.", "items": ["Installation Wi-Fi", "Configuration de routeurs", "Pare-feu", "VPN", "Switches", "Réseaux d’entreprise", "Analyse des performances"], "sort_order": 3}, {"title": "Microsoft 365", "division": "ti", "icon": "☁️", "summary": "Déploiement, administration et accompagnement des outils collaboratifs Microsoft.", "items": ["Microsoft 365", "Exchange Online", "Teams", "SharePoint", "OneDrive", "Intune", "Entra ID (Azure AD)", "Gestion des licences"], "sort_order": 4}, {"title": "Azure Cloud", "division": "ti", "icon": "🌥️", "summary": "Services Azure adaptés aux besoins, aux risques et aux budgets des PME.", "items": ["Machines virtuelles", "Sauvegardes", "Réseaux virtuels", "Migration Cloud", "Surveillance Azure", "Gestion des coûts"], "sort_order": 5}, {"title": "Évaluation de sécurité", "division": "cybersecurite", "icon": "🛡️", "summary": "Évaluation structurée des risques, des accès et des vulnérabilités.", "items": ["Audit de sécurité", "Analyse des risques", "Vérification des accès", "Évaluation des vulnérabilités", "Recommandations"], "sort_order": 6}, {"title": "Protection informatique", "division": "cybersecurite", "icon": "🔐", "summary": "Mesures de protection pour les postes, les serveurs, les identités et Microsoft 365.", "items": ["Antivirus", "EDR", "MFA", "Gestion des mots de passe", "Sécurisation Microsoft 365", "Sécurisation des serveurs", "Durcissement des postes"], "sort_order": 7}, {"title": "Sensibilisation", "division": "cybersecurite", "icon": "🎓", "summary": "Formation pratique des équipes aux risques et aux bonnes pratiques.", "items": ["Formation des employés", "Bonnes pratiques", "Hameçonnage (phishing)", "Protection des données", "Cybersécurité pour PME"], "sort_order": 8}, {"title": "Surveillance", "division": "cybersecurite", "icon": "📊", "summary": "Collecte, analyse et suivi des événements de sécurité.", "items": ["Journalisation", "Analyse des événements", "Tableaux de bord", "Alertes", "Surveillance continue"], "sort_order": 9}, {"title": "Réponse aux incidents", "division": "cybersecurite", "icon": "🚨", "summary": "Accompagnement structuré pour limiter les impacts et rétablir les opérations.", "items": ["Investigation", "Contention", "Restauration", "Rapport d’incident"], "sort_order": 10}, {"title": "Tests d’intrusion", "division": "cybersecurite", "icon": "🧪", "summary": "Tests encadrés visant à valider la résistance des systèmes et des applications.", "items": ["Pentest interne", "Pentest externe", "Tests Web", "Validation des correctifs"], "authorization_note": "Autorisation écrite du client obligatoire avant tout test.", "sort_order": 11}, {"title": "Développement de sites Web", "division": "developpement", "icon": "💻", "summary": "Création et exploitation de sites professionnels pour entreprises et organismes.", "items": ["Sites vitrines", "Sites corporatifs", "Hébergement", "Nom de domaine", "Maintenance", "SEO", "Formulaires", "Intégration IA"], "sort_order": 12}, {"title": "Services numériques aux entreprises", "division": "entreprises", "icon": "🏢", "summary": "Outils et accompagnement pour améliorer l’organisation et le pilotage des PME.", "items": ["Gestion documentaire", "Numérisation", "Inventaires", "Conseils numériques", "Automatisation", "Tableaux de bord", "Accompagnement PME"], "sort_order": 13}]

const grid = document.querySelector('#dynamic-services')
const filters = document.querySelector('#service-filters')
let services = FALLBACK_SERVICES
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

function normalizeItems(items) {
  if (Array.isArray(items)) return items
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return items.split('\n').map(x => x.trim()).filter(Boolean)
    }
  }
  return []
}

function render() {
  if (!grid) return
  const visible = services.filter(service => !activeFilter || service.division === activeFilter)
  if (!visible.length) {
    grid.innerHTML = '<div class="notice">Aucun service n’est publié dans cette catégorie.</div>'
    return
  }

  grid.innerHTML = visible.map(service => `
    <article class="enterprise-card service-public-card">
      <div class="icon-box">${escapeHtml(service.icon || '•')}</div>
      <span class="tag">${escapeHtml(labels[service.division] || service.division)}</span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.summary)}</p>
      <ul>${normalizeItems(service.items).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      ${service.authorization_note ? `<div class="service-warning">${escapeHtml(service.authorization_note)}</div>` : ''}
      <a class="service-cta" href="/soumission.html?service=${encodeURIComponent(service.title)}">Demander ce service</a>
    </article>
  `).join('')
}

async function loadFromSupabase() {
  const params = new URLSearchParams({
    select: 'id,title,division,icon,summary,items,sort_order,authorization_note',
    is_active: 'eq.true',
    show_on_ti: 'eq.true',
    order: 'sort_order.asc'
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/service_catalog?${params}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json'
      },
      cache: 'no-store',
      signal: controller.signal
    })

    const raw = await response.text()
    if (!response.ok) throw new Error(`Supabase ${response.status}: ${raw}`)
    const data = JSON.parse(raw)
    if (!Array.isArray(data) || data.length === 0) throw new Error('Catalogue public vide.')

    services = data
      .map(item => ({ ...item, items: normalizeItems(item.items) }))
      .sort((a,b) => Number(a.sort_order || 100) - Number(b.sort_order || 100))
    render()
  } catch (error) {
    console.error('Synchronisation Supabase impossible; catalogue de secours conservé.', error)
  } finally {
    clearTimeout(timeout)
  }
}

filters?.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]')
  if (!button) return
  activeFilter = button.dataset.filter
  filters.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button))
  render()
})

render()
loadFromSupabase()
