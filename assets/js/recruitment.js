import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const cfg = window.KSL_RECRUITMENT_CONFIG || {}
const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
const division = cfg.division || 'entretien'
const divisions = Array.isArray(cfg.divisions) && cfg.divisions.length ? cfg.divisions : [division]
const source = cfg.source || 'site_entretien'
const jobsNode = document.querySelector('#jobs')
const form = document.querySelector('#application-form')
const jobSelect = document.querySelector('#job_id')
const statusNode = document.querySelector('#form-status')
let jobs = []
const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))
function status(message, type='error'){statusNode.className=`status ${type}`;statusNode.textContent=message}
async function loadJobs(){
  const { data, error } = await supabase.from('job_postings').select('*').in('division',[...divisions,'commun']).eq('status','publiee').order('published_at',{ascending:false})
  if(error){
      jobsNode.innerHTML='<div class="empty">Les offres ne peuvent pas être chargées pour le moment. Veuillez actualiser la page.</div>'
      jobSelect.innerHTML='<option value="">Aucune offre disponible</option>'
      console.error('Erreur chargement offres KSL:', error)
      return
    }
  jobs=data||[]
  jobSelect.innerHTML='<option value="">Sélectionnez une offre</option>'+jobs.map(j=>`<option value="${j.id}">${esc(j.title)}</option>`).join('')
  jobsNode.innerHTML=jobs.length?jobs.map(j=>`<article class="card job"><h3>${esc(j.title)}</h3><div class="badges"><span class="badge">${esc(j.location||'Québec')}</span><span class="badge">${esc(j.employment_type||'')}</span><span class="badge">${esc((j.work_mode||'').replace('_',' '))}</span></div><p>${esc(j.summary)}</p><details><summary>Voir les détails</summary><div class="job-detail"><h4>Description</h4>${esc(j.description)}<h4>Exigences</h4>${esc(j.requirements||'À préciser')}<h4>Avantages</h4>${esc(j.benefits||'À préciser')}</div></details><button class="button apply" data-id="${j.id}">Postuler</button></article>`).join(''):'<div class="empty">Aucune offre publiée actuellement. Vous pouvez envoyer une candidature spontanée.</div>'
  document.querySelectorAll('.apply').forEach(b=>b.onclick=()=>{jobSelect.value=b.dataset.id;form.scrollIntoView({behavior:'smooth'})})
}
form.onsubmit=async event=>{
  event.preventDefault();statusNode.className='hidden'
  const button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='Envoi…'
  try{
    const values=Object.fromEntries(new FormData(form).entries());const file=form.cv.files[0]
    if(!file) throw new Error('Veuillez joindre votre CV.')
    if(file.size>10*1024*1024) throw new Error('Le CV dépasse 10 Mo.')
    const allowed=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowed.includes(file.type)) throw new Error('Format accepté : PDF, DOC ou DOCX.')
    const id=crypto.randomUUID();const clean=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`applications/${id}/${clean}`
    const {error:uploadError}=await supabase.storage.from('recruitment-cv').upload(path,file,{upsert:false,contentType:file.type})
    if(uploadError) throw uploadError
    const payload={id,job_id:values.job_id||null,division,first_name:values.first_name.trim(),last_name:values.last_name.trim(),email:values.email.trim(),phone:values.phone.trim()||null,city:values.city.trim()||null,availability:values.availability.trim()||null,cover_letter:values.cover_letter.trim()||null,cv_path:path,cv_original_name:file.name,consent_privacy:true,status:'nouveau',source}
    const {error}=await supabase.from('job_applications').insert(payload)
    if(error){await supabase.storage.from('recruitment-cv').remove([path]);throw error}
    form.reset();status('Votre candidature a été transmise avec succès.','success')
  }catch(error){console.error(error);status(error.message||'Envoi impossible.')}
  finally{button.disabled=false;button.textContent='Envoyer ma candidature'}
}
loadJobs()
