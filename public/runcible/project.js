(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Illustrative, precomputed adjudications. */
const S = [
 { id:'DR-0417-C', label:'Product label', tokens:['Clinically proven','to reduce','redness','in 7 days.'],
   props:[[0,'A controlled clinical trial supports the effect','1 study · n=42'],[1,'Redness falls measurably against baseline','modest Δ'],[3,'The effect appears within 7 days','28-day endpoint']],
   tests:[['TRUTH',.55,'PARTIAL',1],['POSSIBILITY',1,'PASS'],['ETHICS',.9,'PASS'],['AUTHORITY',.3,'EXCEEDS',1],['LIABILITY',.45,'ELEVATED']],
   verdict:'REPAIR', result:'“Shown in a clinical study to visibly reduce redness within four weeks.”', note:'Owner · Regulatory lead' },
 { id:'DR-0418-M', label:'Policy memo', tokens:['Remote work','reduced','our productivity','last year.'],
   props:[[2,'Productivity was measured, with a baseline','no pre-period metric'],[1,'The change was a reduction','unverified'],[0,'Remote work caused it','confounded']],
   tests:[['TRUTH',.2,'OPEN',1],['POSSIBILITY',1,'PASS'],['ETHICS',.85,'PASS'],['AUTHORITY',.8,'PASS'],['LIABILITY',.6,'MODERATE']],
   verdict:'UNDECIDABLE', result:'Settle it with team-level output for both years, or restate it as perception.', note:'Returned to author · evidence request' },
 { id:'DR-0419-K', label:'Contract clause', tokens:['Supplier may share','customer data','with affiliates','for any purpose.'],
   props:[[1,'Customer data includes personal data','likely'],[3,'Processing purpose is specified','unbounded'],[2,'Affiliates are bound to the same terms','unstated']],
   tests:[['TRUTH',.9,'N/A'],['POSSIBILITY',1,'PASS'],['ETHICS',.25,'FAIL',1],['AUTHORITY',.1,'UNLAWFUL',1],['LIABILITY',.08,'SEVERE',1]],
   verdict:'BLOCK', result:'“Any purpose” cannot satisfy purpose limitation. No rewrite preserves the intent.', note:'Basis · GDPR Art. 5(1)(b) · counsel notified' },
 { id:'DR-0420-G', label:'Government directive', tokens:['Suspend','benefit payments','to all flagged accounts','from Monday.'],
   props:[[0,'The issuer may suspend payments at scale','delegation limit'],[2,'Flags meet the evidentiary threshold','mixed sources'],[3,'Notice periods are satisfied','3 days short']],
   tests:[['TRUTH',.6,'PARTIAL'],['POSSIBILITY',.9,'PASS'],['ETHICS',.4,'CONCERN',1],['AUTHORITY',.2,'EXCEEDS',1],['LIABILITY',.25,'HIGH',1]],
   verdict:'ESCALATE', result:'Routed to the director who holds suspension authority, with the notice gap flagged.', note:'Owner · Director, benefits operations' }
];

const sleep = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));

class Inst {
  constructor(el){ this.el = el; this.run = 0; this.build(); }
  build(){
    this.el.innerHTML = `<div class="i-bar"><span class="st"><span class="led"></span><span class="sid">QUALIFICATION RUN</span></span><span class="rid">——</span></div>
     <p class="i-claim" aria-live="off"></p>
     <div class="i-sec"><span>Propositions</span><span class="pc">0 / 3</span></div><ol class="i-props"></ol>
     <div class="i-sec"><span>Tests</span><span>jurisdiction · evidence · time</span></div>
     <div class="i-tests">${[0,1,2,3,4].map(()=>`<div class="row"><span class="tn"></span><span class="meter"><i></i></span><span class="res"></span></div>`).join('')}</div>
     <div class="i-out"><div class="stampbox"></div><p class="i-result"></p></div>`;
    this.q = s => $(s, this.el);
  }
  async play(sc, loop){
    const my = ++this.run, alive = () => my === this.run;
    const claim = this.q('.i-claim'), props = this.q('.i-props'), rows = $$('.i-tests .row', this.el), stamp = this.q('.stampbox'), res = this.q('.i-result');
    // reset
    this.el.classList.add('running'); props.innerHTML=''; stamp.classList.remove('in'); stamp.textContent=''; res.innerHTML=''; this.q('.pc').textContent='0 / 3';
    this.q('.rid').textContent = sc.id; this.q('.sid').textContent = sc.label.toUpperCase();
    rows.forEach((r,i)=>{ r.className='row'; $('.tn',r).textContent=sc.tests[i][0]; $('i',r).style.transform='scaleX(0)'; $('.res',r).textContent=''; });
    // type
    const full = sc.tokens.join(' ');
    claim.innerHTML = '';
    if (RM) { claim.innerHTML = this.tokensHTML(sc); }
    else {
      const txt = document.createTextNode(''), caret = document.createElement('span'); caret.className='caret';
      claim.append(txt, caret);
      for (let i=1;i<=full.length;i++){ if(!alive()) return; txt.data = full.slice(0,i); await sleep(full[i-1]===' '?55:28); }
      await sleep(350); if(!alive()) return;
      claim.innerHTML = this.tokensHTML(sc);
    }
    const tks = $$('.tk', claim);
    // propositions
    for (let i=0;i<sc.props.length;i++){
      if(!alive()) return;
      const [t, text, status] = sc.props[i];
      tks[t].classList.add('hl'); tks[t].querySelector('sup').textContent += (tks[t].querySelector('sup').textContent?',':'')+'P'+(i+1);
      const li = document.createElement('li'); li.innerHTML = `<span class="pid">P${i+1}</span><span>${text}</span><span class="ps">${status}</span>`;
      props.append(li); requestAnimationFrame(()=>requestAnimationFrame(()=>li.classList.add('in')));
      this.q('.pc').textContent = `${i+1} / 3`;
      await sleep(520);
    }
    // tests
    for (let i=0;i<5;i++){
      if(!alive()) return;
      const [n,w,r,bad] = sc.tests[i], row = rows[i];
      if (bad) row.classList.add('bad');
      $('i',row).style.transform = `scaleX(${w})`;
      await sleep(380); $('.res',row).textContent = r; row.classList.add('done');
      await sleep(120);
    }
    await sleep(350); if(!alive()) return;
    stamp.textContent = sc.verdict; stamp.classList.add('in');
    await sleep(380); if(!alive()) return;
    res.innerHTML = `${sc.result}<small>${sc.note} · Decidability Record ${sc.id}</small>`;
    this.el.classList.remove('running');
    this.el.dispatchEvent(new CustomEvent('done'));
    if (loop && !RM){ await sleep(5200); if(alive() && this.visible !== false) this.play(sc, loop); else if (alive()) this.pending = () => this.play(sc, loop); }
  }
  tokensHTML(sc){ return sc.tokens.map(t=>`<span class="tk">${t}<sup></sup></span>`).join(' '); }
}

/* Hero instrument, paused offscreen */
const heroEl = $('[data-inst="hero"]'), hero = new Inst(heroEl);
new IntersectionObserver(([e])=>{ hero.visible = e.isIntersecting; if (e.isIntersecting && hero.pending){ const p=hero.pending; hero.pending=null; p(); } }).observe(heroEl);
setTimeout(()=>hero.play(S[0], true), RM?0:500);

/* Demo */
const demoEl = $('[data-inst="demo"]'), demo = new Inst(demoEl), tabs = $$('.tabs [role=tab]');
let demoStarted = false;
const pick = i => { tabs.forEach((t,j)=>{ t.setAttribute('aria-selected', String(i===j)); t.tabIndex = i===j?0:-1; }); demo.play(S[i]); };
tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>{ demoStarted = true; pick(i); });
  t.addEventListener('keydown',e=>{ const k={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; if(k){ e.preventDefault(); const n=(i+k+tabs.length)%tabs.length; tabs[n].focus(); demoStarted=true; pick(n);} });
});
new IntersectionObserver(([e],o)=>{ if(e.isIntersecting && !demoStarted){ demoStarted=true; pick(0); o.disconnect(); } },{threshold:.35}).observe(demoEl);

/* Verdict keys */
$$('.key').forEach(k=>k.addEventListener('click',()=>{ const on=k.getAttribute('aria-pressed')==='true'; $$('.key').forEach(x=>x.setAttribute('aria-pressed','false')); k.setAttribute('aria-pressed',String(!on)); }));

/* Thesis words */
const th = $('[data-words]');
const wrapWords = node => { [...node.childNodes].forEach(c=>{ if(c.nodeType===3){ const f=document.createDocumentFragment(); c.data.split(/(\s+)/).forEach(p=>{ if(!p) return; if(/^\s+$/.test(p)) f.append(p); else { const s=document.createElement('span'); s.className='w'; s.textContent=p; f.append(s);} }); c.replaceWith(f);} else wrapWords(c); }); };
wrapWords(th); const words = $$('.w', th);

/* Instrument scene steps */
const stage = $('#stage'), stageName = $('#stage-name'), steps = $$('.steps li');
const names = ['','01 PARSE','02 EXPOSE','03 TEST','04 REPAIR','05 RULE & RECORD'];
const setStep = n => { if (stage.dataset.stage==n) return; stage.dataset.stage=n; stageName.textContent=names[n]; steps.forEach(s=>s.classList.toggle('on', s.dataset.step==n)); };
setStep(1); steps[0].classList.add('on');

/* Oversing graph */
const G = $('#graph'), NS='http://www.w3.org/2000/svg';
const nodes = {
  purpose:[300,70,'Purpose'], program:[470,130,'Programs'], role:[530,290,'Roles'], perm:[490,450,'Permissions'],
  proc:[340,530,'Procedures'], conseq:[160,500,'Consequences'], memory:[70,350,'Memory'], people:[100,170,'People'],
  decision:[300,300,'Decision'], money:[200,110,'Finances'], res:[400,420,'Resources']
};
const edges = [['purpose','program'],['program','role'],['role','perm'],['perm','proc'],['proc','conseq'],['conseq','memory'],['memory','people'],['people','purpose'],
 ['purpose','money'],['money','program'],['people','role'],['role','decision'],['decision','proc'],['decision','memory'],['res','proc'],['program','res'],['money','res'],['memory','purpose'],['perm','decision'],['people','decision']];
const path = [['purpose','program'],['program','role'],['role','decision'],['decision','proc'],['proc','conseq'],['conseq','memory']];
const eEls = {};
edges.forEach(([a,b])=>{ const [x1,y1]=nodes[a],[x2,y2]=nodes[b]; const p=document.createElementNS(NS,'path'); const mx=(x1+x2)/2+(y2-y1)*.12, my=(y1+y2)/2-(x2-x1)*.12; p.setAttribute('d',`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`); p.setAttribute('class','e'); G.append(p); eEls[a+'-'+b]=p; });
const nEls = {};
Object.entries(nodes).forEach(([k,[x,y,l]])=>{ const g=document.createElementNS(NS,'g'); g.setAttribute('class','n'+(k==='decision'?' hub':'')); const c=document.createElementNS(NS,'circle'); c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',k==='decision'?14:8); const t=document.createElementNS(NS,'text'); t.setAttribute('x',x); t.setAttribute('y',y+(y>300?30:-20)); t.setAttribute('text-anchor','middle'); t.textContent=l; g.append(c,t); G.append(g); nEls[k]=g; });
const pkt = document.createElementNS(NS,'circle'); pkt.setAttribute('r',4); pkt.setAttribute('class','pkt'); G.append(pkt);
const ologs = $$('.over-log li'), over = $('#over-track');
const setOver = p => { // p: 0..1 progress through 6 segments
  const k = Math.min(5.999, Math.max(0, p*6)), seg = Math.floor(k), f = k - seg;
  path.forEach(([a,b],i)=>{ eEls[a+'-'+b].classList.toggle('on', i<seg || (i===seg && f>.02)); nEls[a].classList.toggle('on', i<=seg); });
  nEls.memory.classList.toggle('on', seg===5 && f>.9);
  ologs.forEach((l,i)=>l.classList.toggle('on', i<=seg));
  const e = eEls[path[seg].join('-')], L = e.getTotalLength(), pt = e.getPointAtLength(L*f);
  pkt.setAttribute('cx',pt.x); pkt.setAttribute('cy',pt.y);
};
setOver(RM?0.999:0);

/* Scroll loop */
const nav = $('#nav'), mqMobile = matchMedia('(max-width:860px)');
let ticking = false;
const onScroll = () => {
  ticking = false;
  const vh = innerHeight;
  nav.classList.toggle('solid', scrollY > 24);
  if (!RM){
    const r = th.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh*.85 - r.top)/(r.height + vh*.35)));
    const n = Math.round(p*words.length*1.15); words.forEach((w,i)=>w.classList.toggle('on', i<n));
  }
  // steps: active = last whose top passed 55% (mobile: below sticky stage)
  const line = mqMobile.matches ? vh*.72 : vh*.55; let a = 1;
  steps.forEach(s=>{ if (s.getBoundingClientRect().top < line) a = +s.dataset.step; });
  setStep(a);
  if (!RM){
    if (mqMobile.matches){ const r=$('.graph-wrap').getBoundingClientRect(); setOver(Math.min(1,Math.max(0,(vh*.9 - r.top)/(r.height+vh*.4)))); }
    else { const r = over.getBoundingClientRect(); setOver(Math.min(1, Math.max(0, -r.top / (r.height - vh*1.6)))); }
  }
};
addEventListener('scroll', ()=>{ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } }, {passive:true});
addEventListener('resize', onScroll); onScroll();

/* Hero phase indicator mirrors the instrument */
const hf = $$('.hero-foot span');
const mo = new MutationObserver(()=>{
  const nP = $$('.i-props li',heroEl).length, nT = $$('.i-tests .row.done',heroEl).length, st = $('.stampbox.in',heroEl), r = $('.i-result',heroEl).textContent;
  const ph = r ? 5 : st ? 4 : nT ? 2 : nP>1 ? 1 : nP ? 0 : -1;
  hf.forEach((s,i)=>s.classList.toggle('on', i===ph || (ph===4 && i===3)));
});
mo.observe(heroEl,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});

/* Hero grid follows the pointer */
const heroSec = $('.hero');
if (!RM && matchMedia('(pointer:fine)').matches){
  heroSec.addEventListener('pointermove', e => { const r = heroSec.getBoundingClientRect(); heroSec.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%'); heroSec.style.setProperty('--my', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%'); });
}
/* Reveal on enter */
if (!RM){
  const els = $$('.sec-head, .keys .key, .who-grid article, .manifesto li, .over-benefits li, .cta-inner, .thesis-grid p, .scene-head');
  els.forEach((e,i)=>{ e.classList.add('rv'); e.style.transitionDelay = (e.matches('.key,.who-grid article,.over-benefits li') ? ([...e.parentNode.children].indexOf(e)*70) : 0)+'ms'; });
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{rootMargin:'0px 0px -10% 0px'});
  els.forEach(e=>io.observe(e));
}
})();
