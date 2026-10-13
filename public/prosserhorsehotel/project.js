const ENDPOINT = 'https://statecraft.systems/api/prosserhorsehotel/submit';
const photoInput = document.querySelector('[name="photos"]');
function validatePhotos() {
  const files = [...photoInput.files];
  let error = '';
  if (files.length > 10) error = 'Please choose up to 10 photos.';
  else if (files.some(file => !file.type.startsWith('image/'))) error = 'Please choose image files only.';
  else if (files.some(file => file.size > 8 * 1024 * 1024)) error = 'Each photo needs to be 8 MB or smaller.';
  else if (files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) error = 'Please keep the photos under 20 MB together.';
  photoInput.setCustomValidity(error);
  document.querySelector('#photo-status').textContent = error || (files.length ? `${files.length} photos selected. Choose them again if you return later.` : '');
  return !error;
}
function updateProgress() {
  let started = 0;
  document.querySelectorAll('.checklist-section').forEach(section => {
    const hasAnswer = [...section.querySelectorAll('input, textarea, select')].some(input => input.type === 'file' ? input.files.length > 0 : input.value.trim());
    section.querySelector('.section-state').textContent = hasAnswer ? 'Started' : 'Not started';
    if (hasAnswer) started++;
  });
  document.querySelector('#progress-text').textContent = `${started} of 12 sections started`;
  document.querySelector('#progress').value = started;
}
photoInput.addEventListener('change', () => { validatePhotos(); updateProgress(); });
for (const form of document.querySelectorAll('form')) {
  const key = `prosserhorsehotel-${form.id}-v3`;
  const status = document.querySelector(`#${form.id}-status`);
  const saveStatus = document.querySelector(`#${form.id}-save`);
  const controls = [...form.querySelectorAll('input, textarea, select')].filter(input => !['hidden', 'file'].includes(input.type) && input.name !== 'website');
  const labels = Object.fromEntries([...controls, ...form.querySelectorAll('input[type=file]')].map(input => [input.name, input.labels[0].textContent]));
  form.elements._labels.value = JSON.stringify(labels);
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    controls.forEach(input => { if (typeof saved[input.name] === 'string') input.value = saved[input.name]; });
    if (Object.keys(saved).length) saveStatus.textContent = 'Saved on this device';
  } catch { saveStatus.textContent = 'Device saving is unavailable. Keep this page open until you send.'; }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(controls.map(input => [input.name, input.value]))));
      saveStatus.textContent = 'Saved on this device';
    } catch { saveStatus.textContent = 'Device saving is unavailable. Keep this page open until you send.'; }
    updateProgress();
  }
  form.addEventListener('input', save);
  form.addEventListener('change', save);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.id === 'intake' && !validatePhotos()) { photoInput.reportValidity(); return; }
    if (!form.reportValidity()) return;
    save();
    const button = form.querySelector('button[type=submit]');
    button.disabled = true;
    status.textContent = 'Sending your answers…';
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (![200, 201].includes(response.status) || result.ok !== true) throw new Error('Submission failed');
      status.textContent = '';
      const panel = document.createElement('div');
      panel.className = 'success';
      panel.tabIndex = -1;
      panel.innerHTML = '<h3>Thank you — we\'ve got it.</h3><p>We’ll review your answers and use them to finish the website. We’ll get in touch if anything needs clarifying. Your saved answers are still here whenever you want to add more.</p><button type="button">Add more answers</button>';
      form.hidden = true;
      form.after(panel);
      panel.querySelector('button').addEventListener('click', () => { panel.remove(); form.hidden = false; form.querySelector('input[name=name]').focus(); });
      panel.focus();
    } catch {
      status.textContent = 'We couldn’t send this time. Your answers are still here. Please try again, or email ops@statecraft.systems.';
    } finally { button.disabled = false; }
  });
}
updateProgress();
