/* =========================================================
   Nuvexa · tracking.html (live application status)
   Requires js/app.js, js/data.js, js/shell.js
   ========================================================= */
(function () {
  'use strict';

  const { store, esc, formatPhone } = window.Nuvexa;
  const { getJob, applicationProgress, companyInitials, STAGES } = window.NuvexaData;

  const container = document.getElementById('track-list');
  const highlightId = new URLSearchParams(location.search).get('id');
  const refs = store.get('profile')?.references || [];

  const items = (store.get('applications') || [])
    .map((app) => ({ app, job: getJob(app.jobId), sig: '', el: null }))
    .filter((i) => i.job)
    .sort((a, b) => b.app.appliedAt - a.app.appliedAt);

  if (!items.length) {
    container.innerHTML = `
      <div class="card empty">
        <span class="empty__icon" aria-hidden="true">
          <svg class="icon" viewBox="0 0 24 24"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
        </span>
        <h2>Aún no te has postulado</h2>
        <p>Cuando te postules a una vacante, aquí verás cada paso: tus documentos, tus referencias y la respuesta de la empresa.</p>
        <a class="btn btn--primary" href="jobs.html">Buscar vacantes</a>
      </div>`;
    return;
  }

  /* ---------- Formatting ---------- */
  const timeFmt = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });
  const dateFmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  function whenLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 864e5);
    const day = sameDay(d, today) ? 'hoy' : sameDay(d, tomorrow) ? 'mañana' : `el ${dateFmt.format(d)}`;
    return `${day}, ${timeFmt.format(d)}`;
  }

  const countdown = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  };

  // "3101234567" → "310 ••• 4567": enough to recognise it, without exposing the full number.
  const maskPhone = (digits) => formatPhone(digits).replace(/ \d{3} /, ' ••• ');

  /* ---------- Card ---------- */
  function cardInner({ app, job }, p) {
    const waitingCompany = p.current === STAGES.length - 1;
    const timeline = p.stages.map((s, i) => {
      const state = s.done ? 'is-done' : i === p.current ? 'is-current' : '';
      const when = s.done ? timeFmt.format(new Date(s.doneAt)) : i === p.current ? 'En curso' : '';
      return `
        <li class="timeline__item ${state}">
          <div>
            <p>${esc(s.title)}${when ? ` · <span class="timeline__time">${when}</span>` : ''}</p>
            <p class="timeline__desc">${esc(s.desc)}</p>
          </div>
        </li>`;
    }).join('');

    const refRows = refs.length
      ? refs.map((r, i) => {
          const status = i < p.refsConfirmed ? '<span class="badge badge--success">Confirmó</span>'
            : p.current >= 2 ? '<span class="badge badge--progress dot-pulse">Contactando</span>'
            : '<span class="badge">Pendiente</span>';
          return `<li><div>${esc(r.name)}<small>${esc(r.relation)} · +57 ${esc(maskPhone(r.phone))}</small></div>${status}</li>`;
        }).join('')
      : '<li><span class="muted">No registraste referencias. <a href="register.html">Agrégalas</a> para agilizar tu respuesta.</span></li>';

    return `
      <div class="track-card__head">
        <span class="company-logo" aria-hidden="true">${esc(companyInitials(job.company))}</span>
        <div>
          <h2 class="track-card__title"><a href="job-details.html?id=${encodeURIComponent(job.id)}">${esc(job.title)}</a></h2>
          <p class="track-card__sub">${esc(job.company)} · ${esc(job.city)} · Te postulaste ${whenLabel(app.appliedAt)}</p>
        </div>
        ${waitingCompany ? '<span class="badge badge--success">Referencias verificadas</span>' : '<span class="badge badge--progress">En verificación</span>'}
      </div>

      <div class="sla">
        <div class="sla__row">
          <span>Respuesta a más tardar <strong>${whenLabel(p.deadline)}</strong></span>
          <span>Quedan <strong data-countdown></strong></span>
        </div>
        <div class="progress" role="progressbar" aria-label="Avance de la postulación" aria-valuemin="0" aria-valuemax="${STAGES.length}" aria-valuenow="${p.current}">
          <span style="width:${(p.current / (STAGES.length - 1)) * 100}%"></span>
        </div>
        <span>${p.current} de ${STAGES.length - 1} pasos completados</span>
      </div>

      <div class="track-grid">
        <div><h3>Estado</h3><ol class="timeline">${timeline}</ol></div>
        <div><h3>Tus referencias</h3><ul class="ref-status">${refRows}</ul></div>
      </div>

      <div class="track-card__foot">
        <span>Te avisaremos por WhatsApp y correo en cuanto haya novedades.</span>
        <button class="link-btn" type="button" data-account="support">¿Necesitas ayuda?</button>
      </div>`;
  }

  /* ---------- Mount + live updates ---------- */
  container.innerHTML = items.map((i) => `<article class="card track-card${i.job.id === highlightId ? ' is-highlight' : ''}" id="app-${esc(i.job.id)}"></article>`).join('');
  items.forEach((i) => { i.el = document.getElementById(`app-${i.job.id}`); });

  function tick() {
    const now = Date.now();
    items.forEach((item) => {
      const p = applicationProgress(item.app, now);
      const sig = `${p.current}-${p.refsConfirmed}`;
      if (sig !== item.sig) { // re-render only when the status actually changes
        item.el.innerHTML = cardInner(item, p);
        item.sig = sig;
      }
      item.el.querySelector('[data-countdown]').textContent = countdown(p.deadline - now);
    });
  }

  tick();
  setInterval(tick, 1000);
  if (highlightId) document.getElementById(`app-${highlightId}`)?.scrollIntoView({ block: 'start' });
})();
