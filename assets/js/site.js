
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

function normalizeNavPath(a){
  try{return new URL(a.href,location.origin).pathname.replace(/\/index\.html$/,'/')}
  catch{return a.getAttribute('href')||''}
}

function ensureKslGlobalUi(){
  const nav=document.querySelector('.links');
  if(nav){
    const seen=new Set();
    [...nav.querySelectorAll('a')].forEach(a=>{
      const path=normalizeNavPath(a);
      if(seen.has(path)) a.remove(); else seen.add(path);
    });

    const hasProducts=[...nav.querySelectorAll('a')].some(a=>normalizeNavPath(a)==='/produits.html');
    if(!hasProducts){
      const a=document.createElement('a');
      a.href='/produits.html';
      a.textContent='Produits';
      if(location.pathname.endsWith('/produits.html')||location.pathname.endsWith('/ksl-pointage.html')) a.classList.add('active');
      const services=[...nav.querySelectorAll('a')].find(a=>normalizeNavPath(a)==='/services.html');
      if(services) services.insertAdjacentElement('afterend',a); else nav.prepend(a);
    }
  }
}

async function loadPrivacyContacts(){
  const fallback=[{
    role:'Responsable de la protection des renseignements personnels',
    organization:'KSL GROUPE INC.',
    email:'info@kslgroupe.ca',
    address:'9723, rue de la Camomille, Québec (Québec) G2B 0P1',
    public:true,
    principal:true
  }];

  let contacts=fallback;
  try{
    const r=await fetch('/data/responsables-confidentialite.json',{cache:'no-store'});
    if(r.ok){
      const data=await r.json();
      if(Array.isArray(data.responsables)&&data.responsables.length) contacts=data.responsables.filter(x=>x.public!==false);
    }
  }catch(e){console.warn('Configuration vie privée indisponible',e)}

  const principal=contacts.find(x=>x.principal)||contacts[0];
  if(!principal)return;

  document.querySelectorAll('[data-privacy-officer]').forEach(node=>{
    const name=principal.name?'<br>Nom : '+principal.name:'';
    node.innerHTML='<strong>'+principal.role+'</strong><p>'+principal.organization+name+'<br>Courriel : <a href="mailto:'+principal.email+'">'+principal.email+'</a><br>Adresse : '+principal.address+'</p>';
  });

  const footer=document.querySelector('.footer');
  if(footer && !footer.querySelector('.privacy-public')){
    const block=document.createElement('div');
    block.className='container privacy-public';
    block.innerHTML='<div><strong>'+principal.role+'</strong><span>'+principal.organization+'</span></div><div class="privacy-links"><a href="mailto:'+principal.email+'">'+principal.email+'</a><a href="/confidentialite.html">Politique de confidentialité</a></div>';
    const bottom=footer.querySelector('.footer-bottom,.bottom');
    if(bottom) footer.insertBefore(block,bottom); else footer.appendChild(block);
  }
}

ensureKslGlobalUi();
loadPrivacyContacts();
