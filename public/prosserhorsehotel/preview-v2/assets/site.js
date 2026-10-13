const menu = document.querySelector('.mobile-menu');
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
});
const form = document.querySelector('#stay-form');
if (form) {
  const el = form.elements;
  const title = document.querySelector('#estimate-title');
  const total = document.querySelector('#estimate-total');
  const lines = document.querySelector('#estimate-lines');
  const note = document.querySelector('#estimate-note');
  const guests = document.querySelector('#fifth-guests');
  const result = document.querySelector('#request-result');
  const output = document.querySelector('#request-text');
  const status = document.querySelector('#copy-status');
  const money = n => '$' + n.toLocaleString('en-US');
  const dateParts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Los_Angeles', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
  const part = type => dateParts.find(p => p.type === type).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  el.arrival.min = today;
  let plan = '';
  function update() {
    result.hidden = true;
    output.value = '';
    status.textContent = '';
    plan = '';
    const fifth = el.sleep.value === 'fifth';
    guests.hidden = !fifth;
    guests.disabled = !fifth;
    const rig = el.rig.value === 'yes';
    el.rigLength.disabled = !rig;
    el.rigLength.required = rig;
    el.rig.setCustomValidity(el.sleep.value === 'camping' && !rig ? 'Dry camping requires your RV or LQ rig.' : '');
    const dogs = Number(el.dogs.value);
    const pets = fifth ? dogs + Number(el.otherPets.value) : 0;
    el.dogs.setCustomValidity(fifth && pets > 2 ? 'The fifth wheel allows at most two household pets, including dogs.' : '');
    const start = el.arrival.value;
    const end = el.departure.value;
    const nights = (Date.parse(end) - Date.parse(start)) / 86400000;
    el.departure.min = start ? new Date(Date.parse(start) + 86400000).toISOString().slice(0,10) : today;
    el.departure.setCustomValidity(end && (!Number.isFinite(nights) || nights <= 0) ? 'Departure must be after arrival.' : '');
    const horses = Number(el.horses.value);
    el.horses.setCustomValidity(!horses && el.sleep.value === 'elsewhere' ? 'Add horses or choose an on-property sleeping option.' : '');
    title.textContent = 'Choose your dates.';
    total.textContent = '—';
    lines.textContent = '';
    note.textContent = 'Nightly estimates for 1–6 nights. Seven nights or longer need an owner quote.';
    if (!start || !end) return;
    if (start < today || !Number.isInteger(nights) || nights <= 0) { title.textContent = 'Check your dates.'; note.textContent = 'Choose an arrival today or later and a departure after arrival.'; return; }
    if (!el.horses.checkValidity() || !el.dogs.checkValidity() || !el.rig.checkValidity()) { title.textContent = 'Check your stay options.'; note.textContent = el.horses.validationMessage || el.dogs.validationMessage || el.rig.validationMessage; return; }
    title.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'} · base estimate`;
    const items = [];
    if (horses) items.push([`${horses} horses × $35 × ${nights} nights`, horses * 35 * nights]);
    if (el.sleep.value === 'camping') items.push([`Dry camping × $25 × ${nights} nights`,25 * nights]);
    if (fifth) items.push([`Fifth wheel × $110 × ${nights} nights`,110 * nights]);
    if (pets) items.push([`${pets} pets × $20 × ${nights} nights`,pets * 20 * nights]);
    const price = nights >= 7 ? 'Owner quote needed' : money(items.reduce((sum,item) => sum + item[1],0));
    total.textContent = price;
    lines.textContent = nights >= 7 ? 'See the supplied weekly / monthly rates above.' : items.map(([label,amount]) => `${label}: ${money(amount)}`).join('\n');
    note.textContent = nights >= 7 ? 'Week/month boundaries, partial periods and monthly pet-fee application are awaiting owner confirmation. Monthly stays require approval.' : 'Nightly base estimate only. Taxes and additional approved charges pending. Availability has not been checked.';
    const sleeping = {camping:'My RV / LQ — dry camping',fifth:'Stationary fifth wheel',elsewhere:'Elsewhere — horse boarding only'}[el.sleep.value];
    plan = `Prosser Horse Hotel — availability REQUEST (preview only)\nArrival: ${start}\nDeparture: ${end}\nNights: ${nights}\nExpected arrival: ${el.arrivalTime.value}\nHorses: ${horses}\nRig: ${rig ? `${el.rigLength.value || 'Length needed'} feet total, one rig; layout / limits awaiting owner` : 'No rig'}\nSleeping: ${sleeping}\nDogs: ${dogs}`;
    if (fifth) plan += `\nFifth-wheel guests: ${el.adults.value} adults, ${el.children.value} children, ${pets} household pets total`;
    plan += `\nSpace needs: ${horses} paddocks, ${rig ? '1 shared rig space' : 'no rig space'}, ${fifth ? '1 fifth wheel' : 'no fifth wheel'} (owner must verify allocation)\nBase estimate: ${price}${nights < 7 ? '\n'+lines.textContent : ''}\nTaxes / additional charges: awaiting owner\nGuest: ${el.guest.value}\nEmail: ${el.email.value}\nNotes: ${el.notes.value || 'None'}\nAvailability: Placeholder — awaiting owner\nPreview only. Nothing sent, no space held, no confirmed quote. Contact and arrival policies awaiting owner.`;
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', e => {
    e.preventDefault();
    update();
    if (!form.reportValidity() || !plan) return;
    output.value = plan;
    result.hidden = false;
    output.focus();
  });
  document.querySelector('#copy-request').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(output.value); status.textContent = 'Copied. Nothing has been sent.'; }
    catch { output.focus(); output.select(); status.textContent = 'Summary selected. Use your device’s Copy command. Nothing has been sent.'; }
  });
  document.querySelector('#prepare').disabled = false;
  update();
}
