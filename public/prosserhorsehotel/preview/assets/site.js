const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    toggle.focus();
  }
});

const stay = document.querySelector('#stay-form');
if (stay) {
  const title = document.querySelector('#estimate-title');
  const lines = document.querySelector('#estimate-lines');
  const total = document.querySelector('#estimate-total');
  const note = document.querySelector('#estimate-note');
  const allocation = document.querySelector('#allocation');
  const copy = document.querySelector('#copy-stay');
  const status = document.querySelector('#stay-status');
  const guests = document.querySelector('#fifth-guests');
  const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  let summary = '';
  const dateParts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = type => dateParts.find(p => p.type === type).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  stay.elements.arrival.min = today;
  stay.elements.departure.min = today;
  function update() {
    const arrival = stay.elements.arrival.value;
    const departure = stay.elements.departure.value;
    const horses = Number(stay.elements.horses.value);
    const lodging = stay.elements.lodging.value;
    const fifth = lodging === 'fifth';
    guests.hidden = !fifth;
    guests.disabled = !fifth;
    const pets = fifth ? Number(stay.elements.pets.value) : 0;
    const nights = Math.round((Date.parse(departure) - Date.parse(arrival)) / 86400000);
    const rig = horses > 0 || lodging === 'camping';
    stay.elements.departure.min = arrival ? new Date(Date.parse(arrival) + 86400000).toISOString().slice(0,10) : today;
    lines.replaceChildren();
    total.textContent = '—';
    copy.disabled = true;
    status.textContent = '';
    summary = '';
    allocation.textContent = 'No spaces held. Availability is not connected.';
    if (!arrival || !departure) {
      title.textContent = 'Choose your dates.';
      note.textContent = 'Select arrival and departure to see an illustrative nightly base estimate.';
      return;
    }
    if (arrival < today || !Number.isFinite(nights) || nights <= 0) {
      title.textContent = 'Check your dates.';
      note.textContent = 'Arrival must be today or later, with departure after arrival.';
      return;
    }
    if (horses === 0 && lodging === 'offsite') {
      title.textContent = 'Choose a stay.';
      note.textContent = 'Add at least one horse, RV/LQ camping or a fifth-wheel stay.';
      return;
    }
    title.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'} in Prosser.`;
    const resources = [horses ? `${horses} ${horses === 1 ? 'paddock' : 'paddocks'}` : '', rig ? '1 shared rig space' : '', fifth ? '1 fifth wheel' : ''].filter(Boolean).join(' + ');
    allocation.textContent = `Space needs: ${resources}. Extra or oversized rigs need approval. No availability checked or spaces held.`;
    if (fifth && !rig) allocation.textContent += ' Bringing a trailer too? Confirm its parking allocation with the owners.';
    const lodgingName = {offsite:'Sleeping elsewhere',camping:'RV / LQ dry camping',fifth:'Fifth wheel'}[lodging];
    summary = `Prosser Horse Hotel — preview stay plan\nArrival: ${arrival}\nDeparture: ${departure}\nNights: ${nights}\nHorses: ${horses}\nStay: ${lodgingName}\nSpace needs: ${resources}`;
    if (fifth) summary += `\nGuests: ${stay.elements.adults.value} adults, ${stay.elements.children.value} children, ${pets} household pets`;
    copy.disabled = false;
    if (nights >= 7) {
      total.textContent = 'Quote needed';
      note.textContent = 'Weekly and monthly base rates are listed above. Rate boundaries, partial weeks and monthly pet fees need confirmation; this preview does not invent a longer-stay total. Monthly stays require approval.';
      summary += '\nPrice: owner quote needed; see supplied weekly/monthly rates.';
    } else {
      const items = [];
      if (horses) items.push([`${horses} ${horses === 1 ? 'horse' : 'horses'} × $35 × ${nights}`, horses * 35 * nights]);
      if (lodging === 'camping') items.push([`Camping × $25 × ${nights}`,25 * nights]);
      if (fifth) items.push([`Fifth wheel × $110 × ${nights}`,110 * nights]);
      if (pets) items.push([`${pets} ${pets === 1 ? 'pet' : 'pets'} × $20 × ${nights}`,pets * 20 * nights]);
      const dl = document.createElement('dl');
      for (const [label, amount] of items) {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = money(amount);
        row.append(dt,dd);
        dl.append(row);
      }
      lines.append(dl);
      const amount = items.reduce((sum,item) => sum + item[1],0);
      total.textContent = money(amount);
      note.textContent = 'Illustrative nightly base estimate only. Taxes and other approved charges are not included. Final rate rules and availability must be confirmed.';
      summary += `\nIllustrative nightly base estimate: ${money(amount)}. Taxes and other approved charges not included.`;
    }
    summary += '\nPreview only. This is not a reservation or confirmed quote; nothing has been sent.';
  }
  stay.addEventListener('input',update);
  stay.addEventListener('change',update);
  stay.addEventListener('submit', event => event.preventDefault());
  copy.addEventListener('click',async () => {
    try { await navigator.clipboard.writeText(summary); status.textContent = 'Stay plan copied. No reservation or request has been sent.'; }
    catch { status.textContent = 'Copy is unavailable. Select and copy the estimate shown above.'; }
  });
  update();
}

const inquiry = document.querySelector('#inquiry-form');
if (inquiry) {
  const text = document.querySelector('#inquiry-text');
  const status = document.querySelector('#inquiry-status');
  inquiry.addEventListener('submit',event => {
    event.preventDefault();
    const values = new FormData(inquiry);
    text.textContent = `Prosser Horse Hotel inquiry\nFrom: ${values.get('name')}\nEmail: ${values.get('email')}\n\n${values.get('message')}`;
    document.querySelector('#inquiry-result').hidden = false;
    status.textContent = 'Inquiry prepared below. Nothing has been sent. Owner contact details are pending.';
  });
  document.querySelector('#copy-inquiry').addEventListener('click',async () => {
    try {await navigator.clipboard.writeText(text.textContent);status.textContent = 'Inquiry copied. Nothing has been sent.';}
    catch {status.textContent = 'Select the prepared inquiry above and copy it manually. Nothing has been sent.';}
  });
}
