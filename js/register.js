/* =========================================================
   Nuvexa · register.html (profile onboarding)
   Requires js/app.js
   ========================================================= */
(function () {
  'use strict';

  const { toast, store, emailError, phoneError, phoneDigits, formatPhone, validate, setFieldError, setLoading, wait } = window.Nuvexa;

  const form = document.getElementById('profile-form');
  const f = form.elements;
  const skillsGroup = document.getElementById('p-skills');
  const shiftGroup = document.getElementById('p-shift');
  const chips = [...skillsGroup.querySelectorAll('.chip')];

  /* ---------- Restore account + saved profile ---------- */
  const user = store.get('user') || {};
  const saved = store.get('profile') || {};
  f.name.value = saved.name || user.name || '';
  f.email.value = saved.email || user.email || '';
  f.phone.value = saved.phone ? formatPhone(saved.phone) : '';
  ['city', 'category', 'availability'].forEach((key) => {
    if (saved[key]) form.querySelector(`input[name="${key}"]`).closest('[data-select]').querySelector(`[data-value="${saved[key]}"]`)?.click();
  });
  if (saved.shift) form.querySelector(`input[name="shift"][value="${saved.shift}"]`).checked = true;
  chips.forEach((c) => c.setAttribute('aria-pressed', String((saved.skills || []).includes(c.textContent))));
  (saved.references || []).forEach((r, i) => {
    f[`r${i + 1}-name`].value = r.name;
    f[`r${i + 1}-phone`].value = formatPhone(r.phone);
    f[`r${i + 1}-relation`].value = r.relation;
  });

  /* ---------- Interactions ---------- */
  form.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => { input.value = formatPhone(input.value); });
  });

  skillsGroup.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    setFieldError(skillsGroup, '');
  });

  shiftGroup.addEventListener('change', () => setFieldError(shiftGroup, ''));

  /* ---------- Submit ---------- */
  const selectedSkills = () => chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent);
  const required = (value, message) => (value.trim() ? '' : message);

  function referenceChecks(n) {
    const name = f[`r${n}-name`], phone = f[`r${n}-phone`], relation = f[`r${n}-relation`];
    const digits = phoneDigits(phone.value);
    const duplicate =
      digits === phoneDigits(f.phone.value) ? 'No puede ser tu propio número.'
        : n === 2 && digits === phoneDigits(f['r1-phone'].value) ? 'Usa un número distinto al de la referencia 1.'
        : '';
    return [
      [name, required(name.value, `Escribe el nombre de tu referencia ${n}.`)],
      [phone, phoneError(phone.value) || duplicate],
      [relation, required(relation.value, 'Indica su cargo y la empresa donde trabajaron juntos.')],
    ];
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = f.name.value.trim();

    const ok = validate([
      [f.name, !fullName ? 'Ingresa tu nombre completo.' : fullName.split(/\s+/).length < 2 ? 'Incluye nombre y apellido.' : ''],
      [f.email, emailError(f.email.value)],
      [f.phone, phoneError(f.phone.value)],
      [document.getElementById('p-city'), f.city.value ? '' : 'Selecciona tu ciudad.'],
      [document.getElementById('p-category'), f.category.value ? '' : 'Selecciona el área que te interesa.'],
      [document.getElementById('p-availability'), f.availability.value ? '' : 'Cuéntanos cuándo puedes empezar.'],
      [shiftGroup, f.shift.value ? '' : 'Elige un turno (o "Cualquiera").'],
      [skillsGroup, selectedSkills().length ? '' : 'Elige al menos una habilidad.'],
      ...referenceChecks(1),
      ...referenceChecks(2),
    ]);
    if (!ok) {
      toast('Revisa los campos marcados en rojo.', { type: 'error', title: 'Faltan algunos datos' });
      return;
    }

    const button = form.querySelector('[type="submit"]');
    setLoading(button, true);
    store.set('profile', {
      name: fullName,
      email: f.email.value.trim(),
      phone: phoneDigits(f.phone.value),
      city: f.city.value,
      category: f.category.value,
      availability: f.availability.value,
      shift: f.shift.value,
      skills: selectedSkills(),
      references: [1, 2].map((n) => ({
        name: f[`r${n}-name`].value.trim(),
        phone: phoneDigits(f[`r${n}-phone`].value),
        relation: f[`r${n}-relation`].value.trim(),
      })),
    });
    store.set('user', { ...user, name: fullName, email: f.email.value.trim() });
    await wait(700);
    location.href = 'documents.html';
  });
})();
