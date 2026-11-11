/* =========================================================
   Nuvexa · documents.html (ID, résumé, face photo)
   Requires js/app.js
   ========================================================= */
(function () {
  'use strict';

  const { toast, store, validate, setFieldError, setLoading, wait } = window.Nuvexa;

  const MAX_BYTES = 5 * 1024 * 1024;
  const CHECK_SVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const uploaded = { id: null, cv: null, face: false }; // file names only; files never leave the browser

  const fmtSize = (bytes) =>
    bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`;

  /* ---------- File uploads (simulated transfer) ---------- */
  document.querySelectorAll('[data-upload]').forEach((box) => {
    const input = box.querySelector('input[type="file"]');
    const meta = box.querySelector('.upload__meta');
    const action = box.querySelector('.upload__action');
    const icon = box.querySelector('.upload__icon');
    const bar = box.querySelector('.upload__bar');
    const allowed = input.accept.split(',');
    const allowedLabel = allowed.filter((e) => e !== '.jpeg' && e !== '.docx').map((e) => e.slice(1).toUpperCase()).join(', ');
    let run = 0;

    ['dragenter', 'dragover'].forEach((t) => box.addEventListener(t, () => box.classList.add('is-dragover')));
    ['dragleave', 'drop'].forEach((t) => box.addEventListener(t, () => box.classList.remove('is-dragover')));

    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      const thisRun = ++run; // a newer pick cancels the running simulation
      const ext = `.${file.name.split('.').pop().toLowerCase()}`;
      const error =
        !allowed.includes(ext) ? `Formato no permitido. Sube un archivo ${allowedLabel}.`
          : file.size > MAX_BYTES ? `El archivo pesa ${fmtSize(file.size)}. El máximo es 5 MB.`
          : '';

      uploaded[input.name] = null;
      box.classList.remove('is-done');
      box.classList.toggle('is-error', Boolean(error));
      setFieldError(input, error);
      if (error) {
        input.value = '';
        return;
      }

      bar.hidden = false;
      meta.textContent = `Subiendo ${file.name}…`;
      for (let p = 0; p <= 100; p += 10) {
        if (thisRun !== run) return;
        bar.style.setProperty('--p', `${p}%`);
        await wait(90);
      }
      bar.hidden = true;
      box.classList.add('is-done');
      icon.innerHTML = file.type.startsWith('image/') ? `<img src="${URL.createObjectURL(file)}" alt="">` : CHECK_SVG;
      meta.textContent = `${file.name} · ${fmtSize(file.size)} · Cargado`;
      action.textContent = 'Cambiar';
      uploaded[input.name] = file.name;
    });
  });

  /* ---------- Face photo: live camera, or file fallback ---------- */
  const frame = document.getElementById('face-frame');
  const cameraBtn = document.getElementById('camera-btn');
  const faceFile = document.getElementById('face-file');
  let stream = null;

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };

  function setFace(src) {
    stopCamera();
    const img = new Image();
    img.src = src;
    img.alt = 'Tu foto de verificación';
    frame.replaceChildren(img);
    frame.classList.add('is-done');
    cameraBtn.textContent = 'Tomar otra foto';
    uploaded.face = true;
    setFieldError(faceFile, '');
  }

  cameraBtn.addEventListener('click', async () => {
    if (stream) {
      const video = frame.querySelector('video');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0); // keep the mirrored selfie view the user saw
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      setFace(canvas.toDataURL('image/jpeg', 0.85));
      toast('Si no se ve bien, puedes tomar otra.', { type: 'success', title: 'Foto capturada' });
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      const video = document.createElement('video');
      Object.assign(video, { autoplay: true, playsInline: true, muted: true, srcObject: stream });
      frame.classList.remove('is-done');
      frame.replaceChildren(video);
      cameraBtn.textContent = 'Tomar foto';
    } catch {
      toast('Revisa los permisos del navegador o sube una foto desde tu galería.', {
        type: 'warning',
        title: 'No pudimos abrir la cámara',
      });
    }
  });

  faceFile.addEventListener('change', () => {
    const file = faceFile.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFieldError(faceFile, 'Sube una imagen JPG o PNG.');
      return;
    }
    setFace(URL.createObjectURL(file));
  });

  window.addEventListener('pagehide', stopCamera);

  /* ---------- Submit ---------- */
  const form = document.getElementById('docs-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = validate([
      [document.getElementById('up-id'), uploaded.id ? '' : 'Sube tu documento de identidad.'],
      [document.getElementById('up-cv'), uploaded.cv ? '' : 'Sube tu hoja de vida.'],
      [faceFile, uploaded.face ? '' : 'Toma o sube una foto de tu rostro.'],
      [form.elements.consent, form.elements.consent.checked ? '' : 'Necesitamos tu autorización para continuar.'],
    ]);
    if (!ok) return;

    const button = form.querySelector('[type="submit"]');
    setLoading(button, true);
    await wait(1400); // simulated identity check
    stopCamera();
    store.set('documents', { id: uploaded.id, cv: uploaded.cv, face: true, verifiedAt: Date.now() });
    location.href = 'success.html';
  });
})();
