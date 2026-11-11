/* =========================================================
   Nuvexa · index.html (login / sign up)
   Requires js/app.js
   ========================================================= */
(function () {
  'use strict';

  const { toast, store, emailError, setFieldError, setLoading, wait, selectTab, firstName } = window.Nuvexa;
  const card = document.getElementById('auth-card');

  /* ---------- Tabs (behaviour lives in app.js) ---------- */
  const tablist = card.querySelector('[role="tablist"]');
  const showTab = (name) => selectTab(document.getElementById(`tab-${name}`));

  tablist.addEventListener('tabchange', (e) => {
    history.replaceState(null, '', e.detail === 'signup' ? '#registro' : location.pathname + location.search);
  });

  document.querySelectorAll('[data-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.switch);
      document.getElementById(btn.dataset.switch === 'signup' ? 'signup-name' : 'login-email').focus();
    });
  });

  if (location.hash === '#registro') showTab('signup');

  /* ---------- Password visibility ---------- */
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  const validate = (checks, shakeEl = card) => Nuvexa.validate(checks, shakeEl);

  /* ---------- Login ---------- */
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { email, password, remember } = loginForm.elements;

    const ok = validate([
      [email, emailError(email.value)],
      [password, !password.value ? 'Ingresa tu contraseña.'
        : password.value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' : ''],
    ]);
    if (!ok) return;

    const button = loginForm.querySelector('[type="submit"]');
    setLoading(button, true);
    await wait(1100); // simulated authentication

    const user = store.get('user');
    store.set('session', { email: email.value.trim(), remember: remember.checked, startedAt: Date.now() });

    toast('Te estamos llevando a tus vacantes disponibles.', {
      type: 'success',
      title: user?.name ? `¡Hola de nuevo, ${firstName(user.name)}!` : '¡Hola de nuevo!',
      duration: 2200,
    });
    await wait(1500);
    location.href = 'jobs.html';
  });

  /* ---------- Sign up ---------- */
  const signupForm = document.getElementById('signup-form');
  const passwordInput = document.getElementById('signup-password');
  const strength = document.getElementById('signup-strength');
  const strengthHint = document.getElementById('signup-password-hint');
  const STRENGTH_LABELS = [
    'Usa al menos 8 caracteres e incluye un número.',
    'Contraseña débil: agrega números y mayúsculas.',
    'Contraseña aceptable.',
    'Contraseña fuerte.',
    'Contraseña muy segura. ¡Excelente!',
  ];

  passwordInput.addEventListener('input', () => {
    const v = passwordInput.value;
    const score = v
      ? [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v) || v.length >= 12]
          .filter(Boolean).length
      : 0;
    strength.dataset.score = score;
    strengthHint.textContent = STRENGTH_LABELS[score];
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { name, email, password, terms } = signupForm.elements;
    const fullName = name.value.trim();

    const ok = validate([
      [name, !fullName ? 'Ingresa tu nombre completo.'
        : fullName.split(/\s+/).length < 2 ? 'Incluye nombre y apellido.' : ''],
      [email, emailError(email.value)],
      [password, password.value.length < 8 || !/\d/.test(password.value)
        ? 'Usa al menos 8 caracteres e incluye un número.' : ''],
      [terms, terms.checked ? '' : 'Debes aceptar los términos para continuar.'],
    ]);
    if (!ok) return;

    const button = signupForm.querySelector('[type="submit"]');
    setLoading(button, true);
    await wait(1300); // simulated account creation

    // Never persist the password, even in a mockup.
    store.set('user', { name: fullName, email: email.value.trim(), createdAt: Date.now() });
    store.set('session', { email: email.value.trim(), remember: true, startedAt: Date.now() });

    toast('Ahora completa tu perfil para empezar a postularte.', {
      type: 'success',
      title: `¡Cuenta creada, ${firstName(fullName)}!`,
      duration: 2400,
    });
    await wait(1600);
    location.href = 'register.html';
  });

  /* ---------- Forgot password modal ---------- */
  const forgotModal = document.getElementById('forgot-modal');
  const forgotForm = document.getElementById('forgot-form');
  const forgotEmail = document.getElementById('forgot-email');

  // Runs before app.js's delegated opener, so the field is prefilled when the dialog shows.
  document.getElementById('forgot-btn').addEventListener('click', () => {
    forgotEmail.value = loginForm.elements.email.value.trim();
  });

  forgotModal.addEventListener('close', () => {
    setFieldError(forgotEmail, '');
    forgotForm.reset();
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate([[forgotEmail, emailError(forgotEmail.value)]], forgotForm)) return;

    const button = forgotForm.querySelector('[type="submit"]');
    const email = forgotEmail.value.trim();
    setLoading(button, true);
    await wait(1000); // simulated email dispatch
    setLoading(button, false);
    forgotModal.close();

    toast(`Enviamos un enlace de recuperación a ${email}. Revisa también tu carpeta de spam.`, {
      type: 'success',
      title: 'Revisa tu bandeja de entrada',
      duration: 6000,
    });
  });
})();
