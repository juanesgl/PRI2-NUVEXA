/* =========================================================
   Nuvexa · jobs.html (search, filters, sort)
   Requires js/app.js, js/data.js, js/shell.js
   ========================================================= */
(function () {
  'use strict';

  const { store, esc, firstName } = window.Nuvexa;
  const { JOBS, CATEGORIES, SHIFTS, formatCOP, companyInitials, postedLabel } = window.NuvexaData;

  const profile = store.get('profile') || {};
  const name = profile.name || store.get('user')?.name;
  const applied = new Set((store.get('applications') || []).map((a) => a.jobId));

  const list = document.getElementById('job-list');
  const count = document.getElementById('results-count');
  const query = document.getElementById('q');
  const sortInput = document.querySelector('input[name="sort"]');
  const filtersBadge = document.getElementById('filters-active');

  if (name) {
    document.getElementById('greeting').textContent =
      `Hola, ${firstName(name)}. Hay ${JOBS.length} vacantes abiertas y te damos respuesta en 24 horas.`;
  }

  // Filters panel starts collapsed on small screens.
  document.getElementById('filters').open = window.matchMedia('(min-width: 961px)').matches;

  /* ---------- Filter groups with live counts ---------- */
  const CONTRACTS = Object.fromEntries([...new Set(JOBS.map((j) => j.contract))].map((c) => [c, c]));

  function renderGroup(id, field, options) {
    document.getElementById(id).insertAdjacentHTML('beforeend', Object.entries(options)
      .map(([value, label]) => {
        const n = JOBS.filter((j) => j[field] === value).length;
        return `<label class="check"><input type="checkbox" name="${field}" value="${esc(value)}"><span>${esc(label)}</span><span class="filter-count">${n}</span></label>`;
      })
      .join(''));
  }
  renderGroup('f-category', 'category', CATEGORIES);
  renderGroup('f-shift', 'shift', SHIFTS);
  renderGroup('f-contract', 'contract', CONTRACTS);

  /* ---------- Render ---------- */
  const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const checked = (field) => [...document.querySelectorAll(`input[name="${field}"]:checked`)].map((i) => i.value);
  const SORTS = {
    recent: (a, b) => a.postedDays - b.postedDays,
    salary: (a, b) => b.salary - a.salary,
    openings: (a, b) => b.openings - a.openings,
  };
  const ICON = {
    clock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    file: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
    users: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  };

  const card = (j) => `
    <li class="job-card">
      <span class="company-logo" aria-hidden="true">${esc(companyInitials(j.company))}</span>
      <div>
        <h3 class="job-card__title"><a href="job-details.html?id=${encodeURIComponent(j.id)}">${esc(j.title)}</a></h3>
        <p class="job-card__company">${esc(j.company)} · ${esc(j.city)}</p>
        <div class="meta">
          <span class="meta__item">${ICON.clock}Turno ${esc(SHIFTS[j.shift].toLowerCase())}</span>
          <span class="meta__item">${ICON.file}${esc(j.contract)} · ${esc(j.duration)}</span>
          <span class="meta__item">${ICON.users}${j.openings} cupos</span>
        </div>
      </div>
      <div class="job-card__side">
        ${applied.has(j.id) ? '<span class="badge badge--success">Postulado</span>'
          : j.category === profile.category ? '<span class="badge badge--info">Para tu perfil</span>' : '<span></span>'}
        <div>
          <p class="salary">${formatCOP(j.salary)} <small>/ mes</small></p>
          <p class="posted">${postedLabel(j.postedDays)}</p>
        </div>
      </div>
    </li>`;

  function render() {
    const q = normalize(query.value.trim());
    const filters = { category: checked('category'), shift: checked('shift'), contract: checked('contract') };
    const active = Object.values(filters).flat().length;

    const results = JOBS
      .filter((j) => Object.entries(filters).every(([field, values]) => !values.length || values.includes(j[field])))
      .filter((j) => !q || normalize([j.title, j.company, j.city, CATEGORIES[j.category]].join(' ')).includes(q))
      .sort(SORTS[sortInput.value] || SORTS.recent);

    filtersBadge.hidden = !active;
    filtersBadge.textContent = `${active} activo${active === 1 ? '' : 's'}`;
    count.innerHTML = `<strong>${results.length}</strong> ${results.length === 1 ? 'vacante encontrada' : 'vacantes encontradas'}`;

    list.innerHTML = results.length
      ? results.map(card).join('')
      : `<li class="empty card">
           <span class="empty__icon">${ICON.search}</span>
           <h3>No encontramos vacantes con esos filtros</h3>
           <p>Prueba con otra palabra o quita algunos filtros. Publicamos vacantes nuevas todos los días.</p>
           <button class="btn btn--secondary btn--sm" type="button" data-clear-filters>Limpiar filtros</button>
         </li>`;
  }

  /* ---------- Events ---------- */
  document.getElementById('filters').addEventListener('change', render);
  query.addEventListener('input', render);
  sortInput.addEventListener('change', render);
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    render();
    list.querySelector('a, button')?.focus();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-clear-filters]')) return;
    document.querySelectorAll('.filters input:checked').forEach((i) => { i.checked = false; });
    query.value = '';
    render();
    query.focus();
  });

  render();
})();
