const KSL_PORTFOLIO_CONFIG = {
  url: 'https://rgffoijcimsdesezjksi.supabase.co',
  key: 'sb_publishable_h9CaN2YQ5lYXlfqBGT2ofA_ematARSs'
}

const grid = document.querySelector('#dynamic-portfolio')
const filters = document.querySelector('#portfolio-filters')
let projects = []
let activeFilter = ''

const categoryLabels = {
  experience: 'Expérience professionnelle',
  mandat_ksl: 'Mandat KSL',
  formation: 'Formation',
  projet: 'Projet',
  etude_de_cas: 'Étude de cas'
}

const divisionLabels = {
  ti: 'TI',
  cybersecurite: 'Cybersécurité',
  developpement: 'Développement',
  entreprises: 'Services aux entreprises',
  entretien: 'Entretien',
  commun: 'Commun'
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[char])
}

function arrayValue(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function render() {
  const visible = projects.filter(project => !activeFilter || project.division === activeFilter)

  if (!visible.length) {
    grid.innerHTML = '<div class="notice">Aucune réalisation n’est publiée dans cette catégorie.</div>'
    return
  }

  grid.innerHTML = visible.map(project => `
    <article class="portfolio-v5 portfolio-dynamic-card">
      <div class="cover ${project.cover_image_url ? 'has-image' : ''}">
        ${project.cover_image_url
          ? `<img src="${escapeHtml(project.cover_image_url)}" alt="${escapeHtml(project.title)}">`
          : `<span>${escapeHtml(project.icon || '🖥️')}</span>`}
      </div>

      <div class="content">
        <div class="badges">
          <span class="badge">${escapeHtml(categoryLabels[project.category] || project.category)}</span>
          <span class="badge">${escapeHtml(divisionLabels[project.division] || project.division)}</span>
          ${project.featured ? '<span class="badge">En vedette</span>' : ''}
        </div>

        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.summary)}</p>

        ${arrayValue(project.technologies).length
          ? `<div class="badges">${arrayValue(project.technologies).map(item => `<span class="badge">${escapeHtml(item)}</span>`).join('')}</div>`
          : ''}

        ${arrayValue(project.results).length
          ? `<div class="portfolio-results"><strong>Résultats</strong><ul>${arrayValue(project.results).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`
          : ''}

        <div class="portfolio-links">
          ${project.video_url ? `<a href="${escapeHtml(project.video_url)}" target="_blank" rel="noopener">Voir la vidéo</a>` : ''}
          ${project.document_url ? `<a href="${escapeHtml(project.document_url)}" target="_blank" rel="noopener">Voir le document</a>` : ''}
          <a href="/soumission.html?contexte=${encodeURIComponent(project.title)}">Discuter d’un projet similaire</a>
        </div>
      </div>
    </article>
  `).join('')
}

async function load() {
  const params = new URLSearchParams({
    select: 'id,title,category,division,summary,description,technologies,results,icon,cover_image_url,video_url,document_url,project_date,sort_order,featured',
    is_published: 'eq.true',
    show_on_ti: 'eq.true',
    order: 'sort_order.asc'
  })

  try {
    const response = await fetch(`${KSL_PORTFOLIO_CONFIG.url}/rest/v1/portfolio_projects?${params}`, {
      headers: {
        apikey: KSL_PORTFOLIO_CONFIG.key,
        Authorization: `Bearer ${KSL_PORTFOLIO_CONFIG.key}`,
        Accept: 'application/json'
      },
      cache: 'no-store'
    })

    const text = await response.text()
    if (!response.ok) throw new Error(text)

    projects = JSON.parse(text)
    render()
  } catch (error) {
    console.error(error)
    grid.innerHTML = '<div class="notice">Le portfolio est temporairement indisponible. Veuillez réessayer plus tard.</div>'
  }
}

filters?.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]')
  if (!button) return
  activeFilter = button.dataset.filter
  filters.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button))
  render()
})

load()
