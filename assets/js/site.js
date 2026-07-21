
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
