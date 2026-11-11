// Sheet 01. Parts arrive exploded, click into their sockets, then the institution runs.
// The builder's pencil steps back and it keeps running. Pull a part out; let go and it
// clicks back in. Light vanilla code: SVG transforms only, one rAF loop that sleeps when
// the figure is off screen or the tab is hidden.

type Part = {
  id: string; el: SVGGElement; hx: number; hy: number; cx: number; cy: number;
  ox: number; oy: number; or: number; p: number; t0: number;
  dx: number; dy: number; vx: number; vy: number; dragging: boolean; seated: boolean;
};
type Token = { el: SVGCircleElement; leg: number; route: string[]; s: number; wait: boolean };

const NS = 'http://www.w3.org/2000/svg';
const EXPLODE: Record<string, [number, number, number]> = {
  in: [-34, -150, -9], cal: [70, -58, 7], rule: [-90, 120, 38],
  desk: [76, 86, -6], rec: [-170, 40, 11], note: [30, 150, 16],
};
const ORDER = ['in', 'rule', 'cal', 'desk', 'rec', 'note'];
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3));

export function mountAssembly(fig: HTMLElement) {
  const svg = fig.querySelector<SVGSVGElement>('svg.asm')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const notes: Record<string, string> = JSON.parse(fig.querySelector('[data-notes]')!.textContent || '{}');
  const $ = (s: string) => fig.querySelector<HTMLElement>(s)!;
  const statusEl = $('[data-status]'), noteEl = $('[data-note]'), handledEl = $('[data-handled]'), toldEl = $('[data-told]');
  const replay = fig.querySelector<HTMLButtonElement>('[data-replay]')!;
  const defaultNote = noteEl.textContent || '';
  const leaders = svg.querySelector('.leaders')!, tokensG = svg.querySelector('.tokens')!;
  const pencil = svg.querySelector<SVGGElement>('.pencil')!;
  const cells = svg.querySelector('.cells')!, lines = svg.querySelector('.lines')!;
  const screen = svg.querySelector('.screen')!;

  const parts = new Map<string, Part>();
  svg.querySelectorAll<SVGGElement>('.part').forEach((el) => {
    const id = el.dataset.part!; const [hx, hy] = el.dataset.home!.split(' ').map(Number);
    const hit = el.querySelector<SVGRectElement>('.hit')!;
    const cx = +hit.getAttribute('x')! + +hit.getAttribute('width')! / 2;
    const cy = +hit.getAttribute('y')! + +hit.getAttribute('height')! / 2;
    const [ox, oy, or] = EXPLODE[id];
    parts.set(id, { id, el, hx, hy, cx, cy, ox, oy, or, p: 1, t0: 0, dx: 0, dy: 0, vx: 0, vy: 0, dragging: false, seated: true });
  });
  const pipes = [...svg.querySelectorAll<SVGPathElement>('.pipe')].map((el) => ({ el, a: el.dataset.a!, b: el.dataset.b!, len: el.getTotalLength() }));
  const pipe = (a: string, b: string) => pipes.find((x) => x.a === a && x.b === b)!;
  const sockets = new Map([...svg.querySelectorAll<SVGGElement>('.socket')].map((s) => [s.dataset.for!, s]));

  let state: 'exploded' | 'assembling' | 'running' | 'stepped' = 'running';
  let clock = 0, last = performance.now(), speed = 1, attentionUntil = 0;
  let allSeatedAt = -1, steppedAt = -1, nextToken = 0, handled = 0, told = 0;
  let pencilX = 760, pencilY = 560, pencilTX = 760, pencilTY = 560;
  const tokens: Token[] = [];
  let visible = true, raf = 0;

  const setStatus = (s: string) => { if (statusEl.textContent !== s) statusEl.textContent = s; };
  const flash = (el: Element, cls = 'click', ms = 620) => { el.classList.remove(cls); void (el as any).getBBox?.(); el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };

  function place(pt: Part) {
    const k = 1 - ease(pt.p);
    const x = pt.hx + pt.ox * k + pt.dx, y = pt.hy + pt.oy * k + pt.dy, r = pt.or * k;
    pt.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)} ${pt.cx} ${pt.cy})`);
  }

  function explode(at: number) {
    state = 'exploded'; allSeatedAt = -1; steppedAt = -1; clock = 0; nextToken = 0;
    tokens.splice(0).forEach((t) => t.el.remove());
    ORDER.forEach((id, i) => { const pt = parts.get(id)!; pt.p = 0; pt.t0 = at + i * 0.32; pt.seated = false; pt.dx = pt.dy = 0; place(pt); });
    fig.dataset.state = 'exploded'; replay.hidden = true; setStatus('Assembling');
    pencilTX = 760; pencilTY = 560;
  }

  function seat(pt: Part) {
    pt.seated = true; flash(pt.el); const s = sockets.get(pt.id); if (s) flash(s);
    pencilTX = pt.hx + pt.cx + 14; pencilTY = pt.hy + pt.cy + 6;
  }

  function updateLinks() {
    let html = '';
    parts.forEach((pt) => {
      if (pt.seated) return;
      const k = 1 - ease(pt.p);
      const x = pt.hx + pt.ox * k + pt.dx + pt.cx, y = pt.hy + pt.oy * k + pt.dy + pt.cy;
      html += `<line x1="${pt.hx + pt.cx}" y1="${pt.hy + pt.cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    });
    if (leaders.innerHTML !== html) leaders.innerHTML = html;
    sockets.forEach((so, id) => so.classList.toggle('open', !parts.get(id)!.seated));
    pipes.forEach((pp) => pp.el.classList.toggle('slack', !(parts.get(pp.a)!.seated && parts.get(pp.b)!.seated)));
  }

  function spawn() {
    const roll = Math.random();
    const dest = roll < 0.55 ? 'cal' : 'desk';
    const route = ['in>rule', `rule>${dest}`];
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '4.5'); c.setAttribute('class', 'tok');
    tokensG.appendChild(c); tokens.push({ el: c, leg: 0, route, s: 0, wait: false });
    if (Math.random() < 0.2) setTimeout(() => sideToken('note'), 900);
    setTimeout(() => sideToken('rec'), 1000);
  }
  function sideToken(to: string) {
    if (state !== 'running' && state !== 'stepped') return;
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', to === 'note' ? '4' : '3'); c.setAttribute('class', to === 'note' ? 'tok tok-a' : 'tok tok-s');
    tokensG.appendChild(c); tokens.push({ el: c, leg: 0, route: [`rule>${to}`], s: 0, wait: false });
  }
  function arrive(to: string) {
    const pt = parts.get(to)!; flash(pt.el, 'got', 500);
    if (to === 'cal') {
      const r = document.createElementNS(NS, 'rect');
      const col = Math.floor(Math.random() * 5), row = Math.floor(Math.random() * 4);
      r.setAttribute('x', String(col * 40 + 1)); r.setAttribute('y', String(row * 32.5 + 1)); r.setAttribute('width', '38'); r.setAttribute('height', '30.5');
      r.setAttribute('class', 'cell'); cells.appendChild(r); if (cells.childElementCount > 7) cells.firstElementChild!.remove();
      handled++;
    } else if (to === 'desk') { handled++; }
    else if (to === 'rec') {
      const l = document.createElementNS(NS, 'path');
      lines.appendChild(l); while (lines.childElementCount > 7) lines.firstElementChild!.remove();
      [...lines.children].forEach((ln, i) => ln.setAttribute('d', `M26 ${14 + i * 10.5}h${(i * 37) % 30 + 34}`));
    } else if (to === 'note') { told++; flash(screen, 'lit', 1400); }
    handledEl.textContent = String(handled); toldEl.textContent = String(told);
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const target = now < attentionUntil ? 2.4 : 1; speed += (target - speed) * Math.min(1, dt * 6);
    clock += dt * speed;

    let unseated = 0;
    parts.forEach((pt) => {
      if (pt.p < 1 && clock > pt.t0) { pt.p = Math.min(1, pt.p + dt * speed / 0.85); if (pt.p >= 1 && !pt.dragging && Math.hypot(pt.dx, pt.dy) < 1) seat(pt); }
      if (!pt.dragging && (pt.dx || pt.dy)) { // spring home
        pt.vx += (-pt.dx * 180 - pt.vx * 22) * dt; pt.vy += (-pt.dy * 180 - pt.vy * 22) * dt;
        pt.dx += pt.vx * dt; pt.dy += pt.vy * dt;
        if (Math.hypot(pt.dx, pt.dy) < 0.6 && Math.hypot(pt.vx, pt.vy) < 8) { pt.dx = pt.dy = pt.vx = pt.vy = 0; if (pt.p >= 1) seat(pt); }
      }
      if (!pt.dragging && !pt.seated && pt.p >= 1 && !pt.dx && !pt.dy) seat(pt);
      if (!pt.seated) unseated++;
      place(pt);
    });
    updateLinks();

    if ((state === 'exploded' || state === 'assembling') && unseated === 0) {
      state = 'running'; allSeatedAt = clock; fig.dataset.state = 'running'; setStatus('Running'); nextToken = clock + 0.3;
    }
    if (state === 'running' && allSeatedAt >= 0 && clock - allSeatedAt > 2.2) {
      state = 'stepped'; steppedAt = now; fig.dataset.state = 'stepped'; pencilTX = 800; pencilTY = 620; replay.hidden = false;
    }
    if (state === 'stepped') {
      const s = Math.floor((now - steppedAt) / 1000);
      setStatus(unseated ? 'Waiting for a part' : `Running without the builder · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    } else if (state === 'running' && unseated) setStatus('Waiting for a part');

    if ((state === 'running' || state === 'stepped') && clock > nextToken) { if (parts.get('in')!.seated) spawn(); nextToken = clock + 1.25 + Math.random() * 0.9; }
    for (let i = tokens.length - 1; i >= 0; i--) {
      const t = tokens[i]; const [a, b] = t.route[t.leg].split('>'); const pp = pipe(a, b);
      const open = parts.get(a)!.seated && parts.get(b)!.seated;
      if (open) t.s += dt * 150; // svg units per second
      t.el.classList.toggle('held', !open);
      const pnt = pp.el.getPointAtLength(Math.min(t.s, pp.len));
      t.el.setAttribute('cx', pnt.x.toFixed(1)); t.el.setAttribute('cy', pnt.y.toFixed(1));
      if (t.s >= pp.len) {
        if (t.leg + 1 < t.route.length) { t.leg++; t.s = 0; flash(parts.get(b)!.el, 'got', 400); }
        else { arrive(b); t.el.remove(); tokens.splice(i, 1); }
      }
    }

    pencilX += (pencilTX - pencilX) * Math.min(1, dt * 5); pencilY += (pencilTY - pencilY) * Math.min(1, dt * 5);
    pencil.setAttribute('transform', `translate(${pencilX.toFixed(1)} ${pencilY.toFixed(1)})`);
    schedule();
  }
  const schedule = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };

  // Drag: pull a part out of its socket. Let go and it springs back and clicks in.
  const toSvg = (e: PointerEvent) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM()!.inverse()); };
  let drag: { pt: Part; sx: number; sy: number; bx: number; by: number; id: number } | null = null;
  parts.forEach((pt) => {
    pt.el.addEventListener('pointerdown', (e) => {
      if (reduce) return; e.preventDefault();
      const s = toSvg(e); drag = { pt, sx: s.x, sy: s.y, bx: pt.dx, by: pt.dy, id: e.pointerId };
      pt.dragging = true; pt.seated = false; pt.vx = pt.vy = 0; pt.el.setPointerCapture(e.pointerId); fig.classList.add('pulling');
      say(pt.id); schedule();
    });
    pt.el.addEventListener('pointermove', (e) => {
      if (!drag || drag.pt !== pt) return; const s = toSvg(e);
      pt.dx = drag.bx + (s.x - drag.sx); pt.dy = drag.by + (s.y - drag.sy); schedule();
    });
    const up = () => { if (!drag || drag.pt !== pt) return; pt.dragging = false; drag = null; fig.classList.remove('pulling'); attentionUntil = performance.now() + 1200; schedule(); };
    pt.el.addEventListener('pointerup', up); pt.el.addEventListener('pointercancel', up); pt.el.addEventListener('lostpointercapture', up);
    pt.el.addEventListener('pointerenter', () => { highlight(pt.id); say(pt.id); });
    pt.el.addEventListener('pointerleave', () => { if (!drag) { highlight(null); say(null); } });
  });

  function highlight(id: string | null) {
    parts.forEach((pt) => pt.el.classList.toggle('hl', pt.id === id));
    fig.querySelectorAll<HTMLElement>('.legend li').forEach((li) => li.classList.toggle('hl', li.dataset.part === id));
  }
  function say(id: string | null) { noteEl.textContent = id ? notes[id] : defaultNote; }
  function nudge(id: string) { // keyboard and legend: pull the part out a little and let it go
    const pt = parts.get(id)!; if (reduce || pt.p < 1) return;
    const [ox, oy] = EXPLODE[id]; const m = Math.hypot(ox, oy); pt.dx = (ox / m) * 46; pt.dy = (oy / m) * 46; pt.vx = pt.vy = 0; pt.seated = false; schedule();
  }
  fig.querySelectorAll<HTMLButtonElement>('.legend button').forEach((b) => {
    const id = b.dataset.part!;
    b.addEventListener('mouseenter', () => { highlight(id); say(id); });
    b.addEventListener('mouseleave', () => { highlight(null); say(null); });
    b.addEventListener('focus', () => { highlight(id); say(id); });
    b.addEventListener('blur', () => { highlight(null); say(null); });
    b.addEventListener('click', () => { highlight(id); say(id); nudge(id); });
  });
  replay.addEventListener('click', () => { explode(clock + 0.2); schedule(); });

  // Attention speeds it up: pointer over the sheet, scrolling, touching.
  const attend = () => { attentionUntil = performance.now() + 700; };
  fig.addEventListener('pointermove', attend, { passive: true });
  addEventListener('scroll', attend, { passive: true });
  addEventListener('touchstart', attend, { passive: true });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); schedule(); } }).observe(fig);
  document.addEventListener('visibilitychange', () => { last = performance.now(); schedule(); });

  fig.classList.add('mounted');
  if (reduce) {
    fig.dataset.state = 'still'; setStatus('Running'); return;
  }
  explode(0.35); last = performance.now(); schedule();
  (window as any).__asm = { get state() { return state; }, finish() { parts.forEach((p) => { p.p = 1; }); clock += 10; } };
}
