/* =========================================================
   Nuvexa · Shared UI helpers (load on every page, before page scripts)
   Exposes window.Nuvexa (helper list at the bottom of this file).
   Auto-wires: modals, tabs, [data-select] dropdowns, [data-menu-trigger] menus.
   ========================================================= */
(function () {
  'use strict';

  const svg = (paths) =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

  const ICONS = {
    success: svg('<path d="M20 6 9 17l-5-5"/>'),
    error: svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'),
    warning: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  };

  /* ---------- Toasts ---------- */
  // Live region must exist before toasts are inserted so screen readers announce them.
  const region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);

  const MAX_TOASTS = 3;

  function toast(message, { type = 'info', title = '', duration = 4500 } = {}) {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.style.setProperty('--toast-duration', `${duration}ms`);
    el.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${ICONS[type] || ICONS.info}</span>
      <div class="toast__body">
        ${title ? '<p class="toast__title"></p>' : ''}
        <p class="toast__msg"></p>
      </div>
      <button type="button" class="toast__close" aria-label="Cerrar notificación">${ICONS.close}</button>
      <span class="toast__progress" aria-hidden="true"></span>`;
    if (title) el.querySelector('.toast__title').textContent = title;
    el.querySelector('.toast__msg').textContent = message;

    const dismiss = () => {
      if (el.classList.contains('is-leaving')) return;
      el.classList.add('is-leaving');
    };
    el.addEventListener('animationend', (e) => {
      if (e.target === el && el.classList.contains('is-leaving')) el.remove();
    });
    // The progress bar is the timer: hovering pauses it, its end dismisses the toast.
    el.querySelector('.toast__progress').addEventListener('animationend', dismiss);
    el.querySelector('.toast__close').addEventListener('click', dismiss);

    region.appendChild(el);
    const active = region.querySelectorAll('.toast:not(.is-leaving)');
    if (active.length > MAX_TOASTS) active[0].classList.add('is-leaving');

    return { dismiss };
  }

  /* ---------- Modals (native <dialog>, styled in styles.css) ---------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      document.getElementById(opener.dataset.modalOpen)?.showModal();
      return;
    }
    const closer = e.target.closest('[data-modal-close]');
    if (closer) {
      closer.closest('dialog')?.close();
      return;
    }
    // A click that lands on the <dialog> itself (not its content) is a backdrop click.
    if (e.target instanceof HTMLDialogElement && e.target.classList.contains('modal')) {
      e.target.close();
    }
  });

  /* ---------- Tabs (any [role="tablist"]; emits "tabchange" on the list) ---------- */
  function selectTab(tab, focus = false) {
    const list = tab.closest('[role="tablist"]');
    list.querySelectorAll('[role="tab"]').forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
    list.dataset.active = tab.dataset.tab;
    if (focus) tab.focus();
    list.dispatchEvent(new CustomEvent('tabchange', { detail: tab.dataset.tab }));
  }

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  document.addEventListener('keydown', (e) => {
    const tab = e.target.closest?.('[role="tab"]');
    if (!tab) return;
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(tab);
    const n = tabs.length;
    const next = {
      ArrowRight: tabs[(i + 1) % n], ArrowDown: tabs[(i + 1) % n],
      ArrowLeft: tabs[(i - 1 + n) % n], ArrowUp: tabs[(i - 1 + n) % n],
      Home: tabs[0], End: tabs[n - 1],
    }[e.key];
    if (next) {
      e.preventDefault();
      selectTab(next, true);
    }
  });

  /* ---------- Custom select ([data-select]) ----------
     <div class="select" data-select>
       <button class="input select__trigger" id="x" aria-haspopup="listbox" aria-expanded="false">
         <span class="select__value">Placeholder</span></button>
       <ul class="select__list" role="listbox" tabindex="-1"><li role="option" data-value="a">A</li></ul>
       <input type="hidden" name="x">
     </div> */
  function initSelect(root) {
    const trigger = root.querySelector('.select__trigger');
    const list = root.querySelector('[role="listbox"]');
    const hidden = root.querySelector('input[type="hidden"]');
    const valueEl = root.querySelector('.select__value');
    const options = [...list.querySelectorAll('[role="option"]')];
    let active = -1;

    options.forEach((o, i) => { o.id = `${trigger.id}-opt-${i}`; });

    const highlight = (i) => {
      active = (i + options.length) % options.length;
      options.forEach((o, j) => o.classList.toggle('is-active', j === active));
      list.setAttribute('aria-activedescendant', options[active].id);
      options[active].scrollIntoView({ block: 'nearest' });
    };
    const open = () => {
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      list.focus();
      highlight(Math.max(0, options.findIndex((o) => o.getAttribute('aria-selected') === 'true')));
    };
    const close = (refocus = true) => {
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (refocus) trigger.focus();
    };
    const choose = (i) => {
      options.forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
      valueEl.textContent = options[i].textContent;
      root.classList.add('has-value');
      hidden.value = options[i].dataset.value;
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
      setFieldError(trigger, '');
      // Programmatic picks (restoring saved data) happen while closed: don't steal focus.
      close(root.classList.contains('is-open'));
    };

    trigger.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); }
    });
    list.addEventListener('click', (e) => {
      const o = e.target.closest('[role="option"]');
      if (o) choose(options.indexOf(o));
    });
    list.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab') close(false);
    });
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target) && root.classList.contains('is-open')) close(false);
    });
  }

  /* ---------- Menus ([data-menu-trigger] + sibling .menu) ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-menu-trigger]');
    document.querySelectorAll('[data-menu-trigger][aria-expanded="true"]').forEach((t) => {
      if (t !== trigger) t.setAttribute('aria-expanded', 'false');
    });
    if (trigger) {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      if (open) trigger.nextElementSibling.querySelector('a, button')?.focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openTrigger = document.querySelector('[data-menu-trigger][aria-expanded="true"]');
    if (openTrigger) { openTrigger.setAttribute('aria-expanded', 'false'); openTrigger.focus(); }
  });

  /* ---------- Storage (mockup persistence between pages) ---------- */
  const PREFIX = 'nuvexa:';
  const store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        /* storage blocked (private mode): the mockup still navigates, just without memory */
      }
    },
  };

  /* ---------- Forms ---------- */
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  // Error element convention: <p class="field__error" id="{input.id}-error">
  function setFieldError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const error = document.getElementById(`${input.id}-error`);
    if (error) error.textContent = message || '';
  }

  const emailError = (value) =>
    !value.trim() ? 'Ingresa tu correo electrónico.'
      : !isEmail(value) ? 'Revisa el formato del correo (ej. nombre@correo.com).'
      : '';

  // Colombian mobile: 10 digits starting with 3 (spaces allowed).
  const phoneDigits = (value) => value.replace(/\D/g, '');
  const phoneError = (value) =>
    !value.trim() ? 'Ingresa un número de celular.'
      : !/^3\d{9}$/.test(phoneDigits(value)) ? 'Debe tener 10 dígitos y empezar por 3.'
      : '';
  const formatPhone = (value) => phoneDigits(value).slice(0, 10).replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));

  // checks: [[element, messageOrEmpty], ...] → true when all pass. Focuses the first failure.
  function validate(checks, shakeEl) {
    let first = null;
    checks.forEach(([el, message]) => {
      setFieldError(el, message);
      if (message && !first) first = el;
    });
    if (first) {
      (first.matches('input, button, textarea') ? first : first.querySelector('input, button')).focus();
      if (shakeEl) {
        shakeEl.classList.remove('shake');
        void shakeEl.offsetWidth; // restart the animation
        shakeEl.classList.add('shake');
      }
    }
    return !first;
  }
  document.addEventListener('animationend', (e) => {
    if (e.animationName === 'shake') e.target.classList.remove('shake');
  });

  // Clears a field's error as soon as the user edits it.
  document.addEventListener('input', (e) => {
    if (e.target.getAttribute?.('aria-invalid') === 'true') setFieldError(e.target, '');
  });

  function setLoading(button, loading) {
    const label = button.querySelector('.btn__label');
    if (loading) {
      if (label && button.dataset.loadingText) {
        button.dataset.idleText = label.textContent;
        label.textContent = button.dataset.loadingText;
      }
    } else if (label && button.dataset.idleText) {
      label.textContent = button.dataset.idleText;
    }
    button.classList.toggle('is-loading', loading);
    button.disabled = loading;
    button.setAttribute('aria-busy', String(loading));
  }

  // Back button restores pages from bfcache with buttons still spinning; reset them.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('.btn.is-loading').forEach((b) => setLoading(b, false));
  });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const firstName = (fullName) => String(fullName || '').trim().split(/\s+/)[0];

  window.Nuvexa = {
    toast, store, isEmail, emailError, phoneError, phoneDigits, formatPhone,
    validate, setFieldError, setLoading, wait, selectTab, esc, firstName,
  };

  document.querySelectorAll('[data-select]').forEach(initSelect);
})();
