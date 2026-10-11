import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://rgffoijcimsdesezjksi.supabase.co';
const supabaseKey = 'sb_publishable_h9CaN2YQ5lYXlfqBGT2ofA_ematARSs';
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.querySelector('#quote-form');
const statusBox = document.querySelector('#form-status');
const submitButton = form?.querySelector('button[type="submit"]');

function afficherMessage(message, succes = false) {
  if (!statusBox) return;
  statusBox.hidden = false;
  statusBox.textContent = message;
  statusBox.classList.toggle('notice-success', succes);
  statusBox.classList.toggle('notice-error', !succes);
}

if (form && submitButton) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    statusBox.hidden = true;
    statusBox.classList.remove('notice-success', 'notice-error');

    const demande = {
      full_name: document.querySelector('#nom').value.trim(),
      company: document.querySelector('#entreprise').value.trim() || null,
      email: document.querySelector('#courriel').value.trim(),
      phone: document.querySelector('#telephone').value.trim() || null,
      service: document.querySelector('#besoin').value,
      message: document.querySelector('#description').value.trim(),
      priority: 'normale',
      consent_privacy: document.querySelector('#consentement').checked,
      source: 'site_ti',
      status: 'nouveau'
    };

    try {
      const { error } = await supabase.from('quotes').insert(demande);
      if (error) throw error;
      form.reset();
      afficherMessage('Votre demande a été envoyée avec succès. KSL communiquera avec vous prochainement.', true);
    } catch (error) {
      console.error('Erreur Supabase :', error);
      afficherMessage('La demande n’a pas pu être envoyée. Veuillez réessayer ou contacter directement KSL.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Envoyer la demande';
    }
  });
}
