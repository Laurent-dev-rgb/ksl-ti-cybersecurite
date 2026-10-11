
const menu=document.querySelector('.menu'),links=document.querySelector('.links');
if(menu&&links)menu.addEventListener('click',()=>links.classList.toggle('open'));
document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
async function loadPortfolio(){
 const grid=document.querySelector('[data-portfolio]'); if(!grid)return;
 try{
  const data=await fetch('/data/realisations.json',{cache:'no-store'}).then(r=>r.json());
  grid.innerHTML=data.map(x=>`<article class="portfolio-card"><div class="portfolio-cover">${x.icone||'★'}</div><div class="portfolio-body"><span class="tag">${x.categorie}</span><h3>${x.titre}</h3><p>${x.description}</p>${x.resultat?`<p><strong>Résultat :</strong> ${x.resultat}</p>`:''}${x.technologies?`<p><strong>Technologies :</strong> ${x.technologies}</p>`:''}</div></article>`).join('');
 }catch(e){grid.innerHTML='<p>Les réalisations seront ajoutées prochainement.</p>';}
}
loadPortfolio();

const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>ro.observe(e));


function ensureKslGlobalUi(){
  const nav=document.querySelector('.links');
  if(nav && !nav.querySelector('a[href="/produits.html"]')){
    const a=document.createElement('a');
    a.href='/produits.html';
    a.textContent='Produits';
    if(location.pathname.endsWith('/produits.html')||location.pathname.endsWith('/ksl-pointage.html')) a.classList.add('active');
    const services=nav.querySelector('a[href="/services.html"]');
    if(services) services.insertAdjacentElement('afterend',a); else nav.prepend(a);
  }

  const footer=document.querySelector('.footer');
  if(footer && !footer.querySelector('.privacy-public')){
    const block=document.createElement('div');
    block.className='container privacy-public';
    block.innerHTML='<div><strong>Protection des renseignements personnels</strong><span>Responsable de la protection des renseignements personnels — KSL GROUPE INC.</span></div><div class="privacy-links"><a href="mailto:info@kslgroupe.ca">info@kslgroupe.ca</a><a href="/confidentialite.html">Politique de confidentialité</a></div>';
    const bottom=footer.querySelector('.footer-bottom,.bottom');
    if(bottom) footer.insertBefore(block,bottom); else footer.appendChild(block);
  }
}
ensureKslGlobalUi();
