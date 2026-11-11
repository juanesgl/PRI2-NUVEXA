/* =========================================================
   Nuvexa · job-details.html (offer + apply flow)
   Requires js/app.js, js/data.js, js/shell.js
   ========================================================= */
(function () {
  'use strict';

  const { store, esc, setLoading, wait, formatPhone } = window.Nuvexa;
  const { getJob, CATEGORIES, SHIFTS, formatCOP, companyInitials, postedLabel } = window.NuvexaData;

  const detail = document.getElementById('detail');
  const job = getJob(new URLSearchParams(location.search).get('id'));

  if (!job) {
    detail.innerHTML = `
      <div class="card empty">
        <h1 class="page-title">Esta vacante ya no está disponible</h1>
        <p>Puede que se hayan llenado los cupos. Mira otras ofertas parecidas.</p>
        <a class="btn btn--primary" href="jobs.html">Ver vacantes</a>
      </div>`;
    return;
  }

  document.title = `Nuvexa · ${job.title}`;

  const profile = store.get('profile') || {};
  const hasApplied = () => (store.get('applications') || []).some((a) => a.jobId === job.id);
  const trackUrl = `tracking.html?id=${encodeURIComponent(job.id)}`;

  const CHECK = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const list = (items) => `<ul class="check-list">${items.map((i) => `<li>${CHECK}<span>${esc(i)}</span></li>`).join('')}</ul>`;
  const section = (title, body) => `<section class="card detail-section"><h2>${title}</h2>${body}</section>`;

  /* ---------- Render ---------- */
  detail.innerHTML = `
    <div class="detail-layout">
      <div class="detail-main">
        <section class="card">
          <div class="detail-head">
            <span class="company-logo company-logo--lg" aria-hidden="true">${esc(companyInitials(job.company))}</span>
            <div>
              <span class="badge badge--info badge--plain">${esc(CATEGORIES[job.category])}</span>
              <h1 class="page-title">${esc(job.title)}</h1>
              <p class="page-subtitle">${esc(job.company)} · ${esc(job.city)}, Cundinamarca</p>
              <div class="meta">
                <span class="meta__item">Turno ${esc(SHIFTS[job.shift].toLowerCase())}</span>
                <span class="meta__item">${job.openings} cupos</span>
                <span class="meta__item">${postedLabel(job.postedDays)}</span>
              </div>
            </div>
          </div>
        </section>
        ${section('Sobre la vacante', `<p>${esc(job.summary)}</p>`)}
        ${section('Qué harás', list(job.tasks))}
        ${section('Requisitos', list(job.requirements))}
        ${section('Beneficios', list(job.benefits))}
      </div>

      <aside class="card apply-card" aria-label="Postulación">
        <p class="apply-card__salary">${formatCOP(job.salary)} <small>/ mes</small></p>
        <dl class="facts">
          <div><dt>Contrato</dt><dd>${esc(job.contract)}</dd></div>
          <div><dt>Duración</dt><dd>${esc(job.duration)}</dd></div>
          <div><dt>Turno</dt><dd>${esc(SHIFTS[job.shift])}</dd></div>
          <div><dt>Ubicación</dt><dd>${esc(job.city)}</dd></div>
        </dl>
        <div id="apply-slot"></div>
        <p class="sla-note">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>Respuesta en máximo 24 horas. Nuvexa verifica tus referencias por ti.</span>
        </p>
      </aside>
    </div>`;

  const slot = document.getElementById('apply-slot');
  function renderApplyState() {
    slot.innerHTML = hasApplied()
      ? `<div class="applied-state">
           <span class="badge badge--success">Ya te postulaste</span>
           <a class="btn btn--dark btn--block" href="${trackUrl}">Ver seguimiento</a>
         </div>`
      : '<button class="btn btn--primary btn--block" type="button" data-modal-open="apply-modal">Postularme</button>';
  }
  renderApplyState();

  /* ---------- Apply modal ---------- */
  const modal = document.getElementById('apply-modal');
  const confirmStep = document.getElementById('apply-step-confirm');
  const doneStep = document.getElementById('apply-step-done');
  const refs = profile.references || [];

  document.getElementById('apply-desc').textContent = `${job.title} en ${job.company}. Enviaremos tu perfil y documentos a la empresa.`;
  document.getElementById('apply-summary').innerHTML = [
    ['Hoja de vida', store.get('documents') ? 'Adjunta ✓' : 'Por completar'],
    ['Referencias a contactar', refs.length ? refs.map((r) => r.name).join(' y ') : 'Por completar'],
    ['Celular para avisos', profile.phone ? `+57 ${formatPhone(profile.phone)}` : 'Por completar'],
  ].map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('');
  document.getElementById('track-link').href = trackUrl;

  modal.addEventListener('close', () => {
    confirmStep.hidden = false;
    doneStep.hidden = true;
  });

  document.getElementById('apply-confirm').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    setLoading(button, true);
    await wait(1200); // simulated submission
    if (!hasApplied()) {
      store.set('applications', [...(store.get('applications') || []), { jobId: job.id, appliedAt: Date.now() }]);
    }
    setLoading(button, false);
    confirmStep.hidden = true;
    doneStep.hidden = false;
    document.getElementById('track-link').focus();
    renderApplyState();
  });
})();
