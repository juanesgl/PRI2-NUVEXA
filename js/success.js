/* =========================================================
   Nuvexa · success.html (registration summary)
   Requires js/app.js, js/data.js
   ========================================================= */
(function () {
  'use strict';

  const { store, esc, firstName, formatPhone } = window.Nuvexa;
  const { CATEGORIES } = window.NuvexaData;

  const profile = store.get('profile') || {};
  const docs = store.get('documents');

  if (profile.name) {
    document.getElementById('success-message').textContent =
      `${firstName(profile.name)}, tu perfil está completo. Ya puedes postularte a vacantes con un solo clic.`;
  }

  // Values come from localStorage, so they are escaped before going into HTML.
  const rows = [
    ['Nombre', profile.name || '—'],
    ['Celular', profile.phone ? `+57 ${formatPhone(profile.phone)}` : '—'],
    ['Área de interés', CATEGORIES[profile.category] || '—'],
    ['Habilidades', profile.skills?.length ? `${profile.skills.length} seleccionadas` : '—'],
    ['Referencias', profile.references?.length ? `${profile.references.length} registradas` : '—'],
    ['Documentos', docs ? 'Identidad, hoja de vida y foto ✓' : 'Pendientes'],
  ];

  document.getElementById('summary').innerHTML = rows
    .map(([label, value]) => `<div class="summary__row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join('');
})();
