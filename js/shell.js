/* =========================================================
   Nuvexa · App shell for jobs / job-details / tracking
   Renders the top bar into <header id="topbar"> and appends the account
   + logout dialogs, so the three pages share one copy of this markup.
   Page sets <body data-page="jobs|tracking">.
   Requires js/app.js, js/data.js
   ========================================================= */
(function () {
  'use strict';

  const { store, esc, firstName, formatPhone, toast, validate, setLoading, wait, selectTab } = window.Nuvexa;
  const { CATEGORIES, getJob } = window.NuvexaData;

  const user = store.get('user') || {};
  const profile = store.get('profile') || {};
  const docs = store.get('documents');
  const apps = store.get('applications') || [];
  const name = profile.name || user.name || 'Candidato Nuvexa';
  const email = profile.email || user.email || 'sin correo registrado';
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const page = document.body.dataset.page;

  const svg = (d) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    briefcase: svg('<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>'),
    route: svg('<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'),
    bell: svg('<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>'),
    user: svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    shield: svg('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'),
    settings: svg('<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>'),
    help: svg('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
    logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'),
    chevron: svg('<path d="m6 9 6 6 6-6"/>'),
    close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  };

  /* ---------- Top bar ---------- */
  const latest = apps.length ? getJob(apps[apps.length - 1].jobId) : null;
  const notifs = [
    latest && { unread: true, text: `Estamos contactando a tus referencias para <strong>${esc(latest.title)}</strong>.`, time: 'Hace un momento' },
    { unread: !latest, text: 'Hay 3 vacantes nuevas en <strong>Bodega y logística</strong> cerca de ti.', time: 'Hoy, 7:30 a. m.' },
    { unread: false, text: docs ? 'Tus documentos fueron verificados.' : 'Completa tus documentos para postularte más rápido.', time: 'Ayer' },
  ].filter(Boolean);

  document.body.classList.add('has-bottom-nav');
  document.getElementById('topbar').innerHTML = `
    <div class="topbar__inner">
      <a class="brand" href="jobs.html" aria-label="Nuvexa, vacantes">
        <span class="brand__mark" aria-hidden="true"></span>
        <span class="brand__name">NUVEXA</span>
      </a>
      <nav class="app-nav" aria-label="Principal">
        <a href="jobs.html"${page === 'jobs' ? ' aria-current="page"' : ''}>${I.briefcase}Vacantes</a>
        <a href="tracking.html"${page === 'tracking' ? ' aria-current="page"' : ''}>${I.route}Mis postulaciones</a>
      </nav>
      <div class="topbar__end">
        <div class="menu-wrap">
          <button class="icon-btn" type="button" id="notif-btn" data-menu-trigger aria-expanded="false" aria-label="Notificaciones">
            ${I.bell}<span class="icon-btn__dot" aria-hidden="true"></span>
          </button>
          <div class="menu menu--notifs">
            <p class="menu__title">Notificaciones</p>
            ${notifs.map((n) => `<p class="notif${n.unread ? ' notif--unread' : ''}"><span>${n.text}</span><time>${n.time}</time></p>`).join('')}
            <div class="menu__sep"></div>
            <a class="menu__item" href="tracking.html">${I.route}Ver mis postulaciones</a>
          </div>
        </div>
        <div class="menu-wrap">
          <button class="user-btn" type="button" data-menu-trigger aria-expanded="false" aria-label="Menú de tu cuenta">
            <span class="avatar" aria-hidden="true">${esc(initials)}</span>
            <span class="user-btn__name">${esc(firstName(name))}</span>
            ${I.chevron}
          </button>
          <div class="menu">
            <div class="menu__head"><p class="menu__name">${esc(name)}</p><p class="menu__email">${esc(email)}</p></div>
            <div class="menu__sep"></div>
            <button class="menu__item" type="button" data-account="profile">${I.user}Mi perfil</button>
            <button class="menu__item" type="button" data-account="security">${I.shield}Seguridad</button>
            <button class="menu__item" type="button" data-account="settings">${I.settings}Configuración</button>
            <button class="menu__item" type="button" data-account="support">${I.help}Ayuda y soporte</button>
            <div class="menu__sep"></div>
            <button class="menu__item menu__item--danger" type="button" data-modal-open="logout-modal">${I.logout}Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('notif-btn').addEventListener('click', (e) => {
    e.currentTarget.querySelector('.icon-btn__dot')?.remove();
  }, { once: true });

  /* ---------- Account dialog ---------- */
  const settings = { notifWhatsapp: true, notifEmail: true, notifSms: false, recommendations: true, shareProfile: true, twoFactor: false, ...store.get('settings') };
  const toggle = (key, title, text) => `
    <div class="setting-row">
      <div><p class="setting-row__title" id="set-${key}">${title}</p><p class="setting-row__text">${text}</p></div>
      <input class="switch" type="checkbox" role="switch" data-setting="${key}" aria-labelledby="set-${key}"${settings[key] ? ' checked' : ''}>
    </div>`;
  const tab = (key, icon, label, first) =>
    `<button type="button" role="tab" id="acc-tab-${key}" data-tab="${key}" aria-controls="acc-${key}" aria-selected="${first}"${first ? '' : ' tabindex="-1"'}>${icon}${label}</button>`;
  const fact = (label, value) => `<div><dt>${label}</dt><dd>${esc(value || '—')}</dd></div>`;

  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="modal modal--wide" id="account-modal" aria-label="Tu cuenta">
      <button class="modal__close" type="button" data-modal-close aria-label="Cerrar">${I.close}</button>
      <div class="account">
        <div class="side-tabs" role="tablist" aria-orientation="vertical" aria-label="Secciones de tu cuenta">
          <p class="side-tabs__title">Tu cuenta</p>
          ${tab('profile', I.user, 'Perfil', true)}
          ${tab('security', I.shield, 'Seguridad', false)}
          ${tab('settings', I.settings, 'Configuración', false)}
          ${tab('support', I.help, 'Soporte', false)}
        </div>

        <section class="account__panel" role="tabpanel" id="acc-profile" aria-labelledby="acc-tab-profile">
          <div class="profile-head">
            <span class="avatar avatar--lg" aria-hidden="true">${esc(initials)}</span>
            <div><h2>${esc(name)}</h2><p class="muted">${esc(email)}</p></div>
          </div>
          <dl class="facts">
            ${fact('Celular', profile.phone && `+57 ${formatPhone(profile.phone)}`)}
            ${fact('Ciudad', profile.city)}
            ${fact('Área de interés', CATEGORIES[profile.category])}
            ${fact('Referencias', profile.references && `${profile.references.length} registradas`)}
          </dl>
          <div>
            <p class="field__label">Habilidades</p>
            <div class="chips profile-skills">
              ${(profile.skills || []).map((s) => `<span class="badge badge--info badge--plain">${esc(s)}</span>`).join('') || '<span class="muted">Aún no agregas habilidades.</span>'}
            </div>
          </div>
          <div class="setting-row">
            <div><p class="setting-row__title">Documentos</p><p class="setting-row__text">Identidad, hoja de vida y foto facial</p></div>
            ${docs ? '<span class="badge badge--success">Verificados</span>' : '<a class="btn btn--secondary btn--sm" href="documents.html">Completar</a>'}
          </div>
          <a class="btn btn--secondary" href="register.html">Editar perfil</a>
        </section>

        <section class="account__panel" role="tabpanel" id="acc-security" aria-labelledby="acc-tab-security" hidden>
          <h2>Seguridad</h2>
          <form class="form" id="password-form" novalidate>
            <div class="field">
              <label class="field__label" for="pw-current">Contraseña actual</label>
              <input class="input" type="password" id="pw-current" autocomplete="current-password" aria-describedby="pw-current-error">
              <p class="field__error" id="pw-current-error"></p>
            </div>
            <div class="field">
              <label class="field__label" for="pw-new">Nueva contraseña</label>
              <input class="input" type="password" id="pw-new" autocomplete="new-password" aria-describedby="pw-new-error">
              <p class="field__error" id="pw-new-error"></p>
            </div>
            <div><button class="btn btn--dark" type="submit" data-loading-text="Actualizando…"><span class="btn__spinner" aria-hidden="true"></span><span class="btn__label">Actualizar contraseña</span></button></div>
          </form>
          <div>
            ${toggle('twoFactor', 'Verificación en dos pasos', 'Te enviamos un código por WhatsApp cada vez que inicies sesión.')}
            <div class="setting-row">
              <div><p class="setting-row__title">Este dispositivo</p><p class="setting-row__text">Sesión iniciada hoy</p></div>
              <span class="badge badge--success">Activa</span>
            </div>
          </div>
        </section>

        <section class="account__panel" role="tabpanel" id="acc-settings" aria-labelledby="acc-tab-settings" hidden>
          <h2>Configuración</h2>
          <div>
            ${toggle('notifWhatsapp', 'Avisos por WhatsApp', 'Cambios en tus postulaciones y respuestas de empresas.')}
            ${toggle('notifEmail', 'Avisos por correo', 'Resumen de tus postulaciones y documentos.')}
            ${toggle('notifSms', 'Avisos por SMS', 'Útil si no tienes datos móviles.')}
            ${toggle('recommendations', 'Vacantes recomendadas', 'Te sugerimos ofertas según tus habilidades.')}
            ${toggle('shareProfile', 'Perfil visible para empresas aliadas', 'Las empresas pueden invitarte a sus vacantes.')}
          </div>
        </section>

        <section class="account__panel" role="tabpanel" id="acc-support" aria-labelledby="acc-tab-support" hidden>
          <h2>Ayuda y soporte</h2>
          <div class="faq">
            <details><summary>¿Cuánto tarda la respuesta a mi postulación?</summary><p>Máximo 24 horas. El tiempo depende de qué tan rápido respondan tus referencias; las contactamos apenas te postulas.</p></details>
            <details><summary>¿Qué les preguntan a mis referencias?</summary><p>Confirmamos que trabajaste con ellas, el cargo, el tiempo y si te volverían a contratar. Nada más.</p></details>
            <details><summary>¿Puedo cambiar mis referencias?</summary><p>Sí, desde “Editar perfil”. Los cambios aplican a tus próximas postulaciones.</p></details>
            <details><summary>¿Quién ve mis documentos?</summary><p>Solo las empresas a las que te postulas. Puedes desactivar la visibilidad de tu perfil en Configuración.</p></details>
          </div>
          <form class="form" id="support-form" novalidate>
            <div class="field">
              <label class="field__label" for="support-msg">¿No encontraste tu respuesta? Escríbenos</label>
              <textarea class="input textarea" id="support-msg" placeholder="Cuéntanos qué necesitas" aria-describedby="support-msg-error"></textarea>
              <p class="field__error" id="support-msg-error"></p>
            </div>
            <div><button class="btn btn--dark" type="submit" data-loading-text="Enviando…"><span class="btn__spinner" aria-hidden="true"></span><span class="btn__label">Enviar mensaje</span></button></div>
          </form>
        </section>
      </div>
    </dialog>

    <dialog class="modal" id="logout-modal" aria-labelledby="logout-title" aria-describedby="logout-desc">
      <div class="modal__inner">
        <div>
          <h2 class="modal__title" id="logout-title">¿Cerrar sesión?</h2>
          <p class="modal__desc" id="logout-desc">Tus postulaciones siguen activas. Te avisaremos por WhatsApp cuando haya respuesta.</p>
        </div>
        <div class="modal__actions">
          <button class="btn btn--secondary" type="button" data-modal-close>Cancelar</button>
          <button class="btn btn--dark" type="button" id="logout-confirm">Cerrar sesión</button>
        </div>
      </div>
    </dialog>`);

  const accountModal = document.getElementById('account-modal');

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-account]');
    if (!opener) return;
    selectTab(document.getElementById(`acc-tab-${opener.dataset.account}`));
    accountModal.showModal();
  });

  accountModal.addEventListener('change', (e) => {
    const key = e.target.dataset.setting;
    if (!key) return;
    settings[key] = e.target.checked;
    store.set('settings', settings);
    toast(e.target.checked ? 'Activado.' : 'Desactivado.', { type: 'success', title: 'Preferencia guardada', duration: 2000 });
  });

  const pwForm = document.getElementById('password-form');
  pwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('pw-current');
    const next = document.getElementById('pw-new');
    const ok = validate([
      [current, current.value ? '' : 'Ingresa tu contraseña actual.'],
      [next, next.value.length < 8 || !/\d/.test(next.value) ? 'Usa al menos 8 caracteres e incluye un número.'
        : next.value === current.value ? 'Debe ser distinta a la actual.' : ''],
    ]);
    if (!ok) return;
    const button = pwForm.querySelector('[type="submit"]');
    setLoading(button, true);
    await wait(900);
    setLoading(button, false);
    pwForm.reset();
    toast('Usa la nueva contraseña la próxima vez que ingreses.', { type: 'success', title: 'Contraseña actualizada' });
  });

  const supportForm = document.getElementById('support-form');
  supportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('support-msg');
    if (!validate([[msg, msg.value.trim().length < 10 ? 'Escribe al menos 10 caracteres para poder ayudarte.' : '']])) return;
    const button = supportForm.querySelector('[type="submit"]');
    setLoading(button, true);
    await wait(900);
    setLoading(button, false);
    supportForm.reset();
    toast(`Te responderemos a ${email} en menos de 24 horas.`, { type: 'success', title: 'Mensaje enviado' });
  });

  document.getElementById('logout-confirm').addEventListener('click', () => {
    store.set('session', null);
    location.href = 'index.html';
  });
})();
