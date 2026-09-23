(function () {
  var SITE = 'https://www.pnwmobilehomes.com';
  var select = document.getElementById('preview-page');
  var preview = document.getElementById('site-preview');
  var link = document.getElementById('open-preview');
  if (select && preview && link) {
    select.addEventListener('change', function () {
      var path = select.value;
      preview.src = SITE + path;
      preview.title = 'PNW Mobile Homes, live site, ' + select.options[select.selectedIndex].text;
      link.href = SITE + path;
    });
  }

  var SPIKES_ENDPOINT = 'https://spikes.sh/spikes';
  var SPIKES_PROJECT = 'pnw';
  var PICKS_KEY = 'pnw-picks';
  var form = document.getElementById('decision-form');
  var status = document.getElementById('decision-status');
  if (!form) return;

  var nameField = form.querySelector('input[name="reviewer"]');
  var submit = form.querySelector('button[type="submit"]');

  function remember(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }
  function recall(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }

  function loadPicks() {
    try { return JSON.parse(recall(PICKS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function savePicks(picks) { remember(PICKS_KEY, JSON.stringify(picks)); }

  function currentPicks() {
    var picks = {};
    form.querySelectorAll('.vote[aria-pressed="true"], .pick[aria-pressed="true"]').forEach(function (btn) {
      picks[btn.getAttribute('data-k')] = btn.getAttribute('data-v');
    });
    return picks;
  }

  function applyPicks(picks) {
    Object.keys(picks).forEach(function (k) {
      form.querySelectorAll('[data-k="' + k + '"]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-v') === picks[k] ? 'true' : 'false');
      });
    });
  }

  function setExclusive(btn) {
    var k = btn.getAttribute('data-k');
    form.querySelectorAll('[data-k="' + k + '"]').forEach(function (other) {
      other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
    });
    savePicks(currentPicks());
  }

  form.addEventListener('click', function (event) {
    var btn = event.target.closest('.vote, .pick');
    if (!btn || !form.contains(btn)) return;
    event.preventDefault();
    setExclusive(btn);
  });

  applyPicks(loadPicks());

  Array.prototype.slice.call(form.querySelectorAll('input, textarea')).forEach(function (field) {
    if (!field.name || field.name === 'reviewer') return;
    var saved = recall('pnw-decision-' + field.name);
    if (saved) field.value = saved;
    field.addEventListener('input', function () { remember('pnw-decision-' + field.name, field.value); });
  });
  if (nameField) {
    nameField.value = recall('pnw-decision-reviewer');
    nameField.addEventListener('input', function () { remember('pnw-decision-reviewer', nameField.value); });
  }

  var reviewerId = recall('pnw-decision-reviewer-id');
  if (!reviewerId) {
    reviewerId = 'r' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    remember('pnw-decision-reviewer-id', reviewerId);
  }

  var LABELS = {
    'story.front': 'STORY: who fronts the site',
    'story.draft': 'STORY: our draft is roughly right',
    'story.interview': 'STORY: will sit for a recorded interview',
    'story.nocommission': 'STORY: "no commissions, ever" as a promise',
    'out.prebuilt': 'OUTREACH: pre-built listings sent personally',
    'out.trades': 'OUTREACH: trades as distribution before advertisers',
    'out.parks': 'OUTREACH: a free page per park',
    'out.flyers': 'OUTREACH: printed flyers on park boards',
    'out.content': 'OUTREACH: articles only Ben could write',
    'out.groups': 'OUTREACH: answering questions in Facebook groups',
    'und.dealer': 'UNDERSTOOD: stepping out of dealer of record',
    'und.venue': 'UNDERSTOOD: the venue, not the seller',
    'und.dealflow': 'UNDERSTOOD: marketplace also stays deal flow',
    'und.decade': 'UNDERSTOOD: ten years a dealer, hundreds of homes',
    'und.free': 'UNDERSTOOD: listings free for sellers and dealers',
    'und.audience': 'UNDERSTOOD: the audience is the product',
    'und.selfserve': 'UNDERSTOOD: dealers run their own inventory',
    'und.regional': 'UNDERSTOOD: MHVillage model, regional wedge',
    'und.milestones': 'UNDERSTOOD: $1,000/mo then $5,000+/mo then other regions',
    'und.overhead': 'UNDERSTOOD: low admin overhead above features',
    'und.open': 'UNDERSTOOD: not married to what is already built',
    'und.nooverbuild': 'UNDERSTOOD: do not overbuild before proving it',
    'und.previous': 'UNDERSTOOD: previous help was fee-per-task',
    'und.stack': 'UNDERSTOOD: Namecheap domain, rest Brilliant Directories',
    'und.hours': 'UNDERSTOOD: nine hours apart, 08:30-20:00 CEST',
    'asm.accurate': 'ASSESSMENT: the findings are accurate',
    'asm.platform': 'ASSESSMENT: staying on Brilliant Directories is right',
    'asm.nopayers': 'ASSESSMENT: nobody is currently paying to list',
    'paywall.free': 'Free listings for private sellers',
    'paywall.dealers': 'Free for dealer inventory',
    'paywall.featured': 'Keep a paid featured tier in the background',
    'paywall.retire': 'Retire the old pricing page',
    'identity.remove': 'Stop showing the dealership as seller of record',
    'identity.attorney': 'Attorney reviews it first',
    'identity.consult': 'Consultations stay under the dealership name',
    'claims.visitors': 'Soften the 3,000 visitor claim',
    'claims.sellers': 'Remove “join hundreds of sellers”',
    'claims.article': 'Pause the $500 sponsored article',
    'filters.beds': 'Filter: bedrooms and bathrooms',
    'filters.sqft': 'Filter: square footage',
    'filters.width': 'Filter: single / double / triple wide',
    'filters.year': 'Filter: year built',
    'filters.moved': 'Filter: must be moved or stays in place',
    'filters.park': 'Filter: park or community name',
    'filters.county': 'Filter: county',
    'filters.lotrent': 'Filter: lot rent',
    buyerq: 'The buyer’s real question',
    'inv.dealers': 'Ben calls dealers he knows',
    'inv.import': 'Import dealer inventory from their own files',
    'inv.own': 'Load Ben’s own past and current listings',
    'inv.blocked': 'Go back to sellers who hit the paywall',
    'inv.parks': 'Parks and communities list vacant homes',
    demand: 'Who owns demand',
    'start.scope': 'Phase 1 as scoped',
    'start.terms': '$1,500 upfront, one month'
  };

  var VALUES = {
    ben_front: 'the site is visibly Ben\u2019s',
    neutral: 'a neutral marketplace brand',
    afford: 'can I afford this, all-in',
    place: 'can I put it where I need it',
    condition: 'is it in decent shape',
    location: 'is it near where I need to be',
    ben: 'Ben does it',
    hire: 'Ben brings someone in',
    later: 'not settled yet'
  };

  function prettyVal(v) {
    if (VALUES[v]) return VALUES[v];
    if (v === 'yes') return 'yes';
    if (v === 'no') return 'no';
    return v;
  }

  function articleAnswer(article) {
    var lines = [];
    var seen = {};
    article.querySelectorAll('.vote[aria-pressed="true"], .pick[aria-pressed="true"]').forEach(function (btn) {
      var k = btn.getAttribute('data-k');
      if (seen[k]) return;
      seen[k] = true;
      var label = LABELS[k] || k;
      lines.push(label + ': ' + prettyVal(btn.getAttribute('data-v')));
    });
    article.querySelectorAll('input, textarea').forEach(function (field) {
      if (!field.name || field.name === 'reviewer' || !field.value.trim()) return;
      lines.push(field.name.replace(/_/g, ' ') + ': ' + field.value.trim());
    });
    return lines.join('\n');
  }

  function mailtoFor(answers, name) {
    var lines = answers.map(function (a) { return a.title + '\n' + a.answer; });
    return 'mailto:contact@statecraft.systems?subject=' + encodeURIComponent('PNW Mobile Homes decisions' + (name ? ' from ' + name : ''))
      + '&body=' + encodeURIComponent(lines.join('\n\n'));
  }

  function postSpike(answer, name) {
    var spike = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      type: 'page',
      projectKey: SPIKES_PROJECT,
      page: 'PNW Mobile Homes decisions',
      url: location.origin + '/pnw/#' + answer.id,
      reviewer: { id: reviewerId, name: name },
      rating: null,
      comments: answer.title + '\n\n' + answer.answer,
      timestamp: new Date().toISOString(),
      viewport: { width: Math.max(1, Math.round(window.innerWidth)), height: Math.max(1, Math.round(window.innerHeight)) },
      resolved: false
    };
    return fetch(SPIKES_ENDPOINT, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spike) })
      .then(function (r) {
        if (r.ok) return;
        return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 200)); });
      });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = nameField ? nameField.value.trim() : '';
    var answers = Array.prototype.slice.call(form.querySelectorAll('article[data-field]')).map(function (article) {
      var h = article.querySelector('h3');
      return { id: article.id, title: h ? h.textContent.trim() : article.id, answer: articleAnswer(article) };
    }).filter(function (a) { return a.answer; });

    if (!name) { status.textContent = 'Add your name so we know who answered.'; if (nameField) nameField.focus(); return; }
    if (!answers.length) { status.textContent = 'Tap a few ✓ / ✕ first.'; return; }

    submit.disabled = true; submit.textContent = 'Sending…';
    status.textContent = '';
    Promise.all(answers.map(function (a) { return postSpike(a, name); }))
      .then(function () {
        status.textContent = 'Sent. ' + answers.length + (answers.length === 1 ? ' answer' : ' answers') + ' reached us.';
        submit.textContent = 'Sent ✓';
        remember('pnw-decision-sent', new Date().toISOString());
      })
      .catch(function (err) {
        console.error('[decisions] send failed', err);
        var detail = err && err.message ? ' (' + String(err.message).replace(/[<>&]/g, '') + ')' : '';
        status.innerHTML = 'That didn’t go through' + detail + '. <a href="' + mailtoFor(answers, name).replace(/"/g, '&quot;') + '">Send the answers by email instead</a>.';
        submit.disabled = false; submit.textContent = 'Send these answers ↗';
      });
  });
})();
