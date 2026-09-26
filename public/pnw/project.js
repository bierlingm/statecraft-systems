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

  // Answers go to Moritz's Zo, which stores them before replying and texts him once a
  // sitting goes quiet. Spikes stays as a best-effort mirror so the record Ben started
  // on 2026-09-24 keeps running in one place; a Spikes failure never blocks the room.
  var INTAKE_ENDPOINT = 'https://bierlingm.zo.space/api/pnw/answers';
  var SPIKES_ENDPOINT = 'https://spikes.sh/spikes';
  var SPIKES_PROJECT = 'pnw';
  var PICKS_KEY = 'pnw-picks';
  var form = document.getElementById('decision-form');
  var status = document.getElementById('decision-status');
  if (!form) return;

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

  function press(btn, on) {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    // These are toggle buttons, not radios. Carrying aria-checked as well kept
    // screen readers reading every option as unchecked; drop it where it exists.
    if (btn.hasAttribute('aria-checked')) btn.removeAttribute('aria-checked');
  }

  function currentFields() {
    var out = {};
    form.querySelectorAll('textarea, input:not([type="hidden"])').forEach(function (field) {
      if (!field.name || !field.value.trim()) return;
      if (field.value.trim() === (field.getAttribute('data-default') || '\u0000')) return;
      out[field.name] = field.value.trim();
    });
    return out;
  }

  function applyPicks(picks) {
    Object.keys(picks).forEach(function (k) {
      form.querySelectorAll('[data-k="' + k + '"]').forEach(function (btn) {
        press(btn, btn.getAttribute('data-v') === picks[k]);
      });
    });
  }

  // Tapping the answer that is already chosen clears the group. Without this
  // there is no way back to "unanswered": a mistap on a phone sends a wrong
  // answer that can only be swapped for a different wrong answer, never undone.
  function setExclusive(btn) {
    var k = btn.getAttribute('data-k');
    var undo = btn.getAttribute('aria-pressed') === 'true';
    form.querySelectorAll('[data-k="' + k + '"]').forEach(function (other) {
      press(other, !undo && other === btn);
    });
    var picks = currentPicks();
    if (undo) delete picks[k];
    savePicks(picks);
    return undo;
  }

  form.addEventListener('click', function (event) {
    var btn = event.target.closest('.vote, .pick');
    if (!btn || !form.contains(btn)) return;
    event.preventDefault();
    if (setExclusive(btn) && status) status.textContent = 'Cleared that one.';
  });

  form.querySelectorAll('[aria-checked]').forEach(function (btn) { btn.removeAttribute('aria-checked'); });
  form.querySelectorAll('[role="radio"]').forEach(function (btn) { btn.removeAttribute('role'); });

  applyPicks(loadPicks());

  Array.prototype.slice.call(form.querySelectorAll('input, textarea')).forEach(function (field) {
    if (!field.name) return;
    var saved = recall('pnw-decision-' + field.name);
    if (saved) field.value = saved;
    field.addEventListener('input', function () { remember('pnw-decision-' + field.name, field.value); });
  });

  // "Tap three, in order." The previous version put nine options against three
  // radio columns, which asked for nine answers to a three-answer question and
  // could never be undone. Here a tap adds, a second tap removes, and the order
  // of tapping is the ranking. The result lives in a hidden field, so it saves,
  // sends and restores through exactly the same path as every other answer.
  Array.prototype.slice.call(form.querySelectorAll('[data-pick3]')).forEach(function (list) {
    var max = parseInt(list.getAttribute('data-max'), 10) || 3;
    var out = document.getElementById(list.getAttribute('data-pick3'));
    var hint = list.parentNode.querySelector('[data-pick3-hint]');
    var buttons = Array.prototype.slice.call(list.querySelectorAll('.p3'));
    var order = [];
    var SEP = ' \u00b7 ';

    function labelOf(btn) {
      var strong = btn.querySelector('strong');
      return strong ? strong.textContent.trim() : btn.getAttribute('data-v');
    }
    function byValue(v) {
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-v') === v) return buttons[i];
      }
      return null;
    }
    function paint() {
      buttons.forEach(function (btn) {
        var at = order.indexOf(btn.getAttribute('data-v'));
        btn.setAttribute('aria-pressed', at >= 0 ? 'true' : 'false');
        var badge = btn.querySelector('.p3-n');
        if (badge) badge.textContent = at >= 0 ? String(at + 1) : '';
      });
      if (out) {
        out.value = order.map(function (v, i) {
          var btn = byValue(v);
          return (i + 1) + '. ' + (btn ? labelOf(btn) : v);
        }).join(SEP);
      }
    }
    function say(text) { if (hint) hint.textContent = text; }
    function tally() {
      if (!order.length) return say('Tap up to ' + max + '. Tap again to release one.');
      if (order.length < max) return say(order.length + ' of ' + max + ' chosen.');
      say('All ' + max + ' chosen. Tap one again to swap it out.');
    }

    // Restore from the value the field loop above already pulled out of storage.
    if (out && out.value) {
      out.value.split(SEP).forEach(function (part) {
        var name = part.replace(/^\s*\d+\.\s*/, '').trim().toLowerCase();
        buttons.forEach(function (btn) {
          if (labelOf(btn).toLowerCase() === name && order.indexOf(btn.getAttribute('data-v')) < 0) {
            order.push(btn.getAttribute('data-v'));
          }
        });
      });
    }

    list.addEventListener('click', function (event) {
      var btn = event.target.closest('.p3');
      if (!btn || !list.contains(btn)) return;
      event.preventDefault();
      var v = btn.getAttribute('data-v');
      var at = order.indexOf(v);
      if (at >= 0) order.splice(at, 1);
      else if (order.length >= max) {
        say('That is ' + max + ' already \u2014 tap one of the chosen to release it first.');
        return;
      } else order.push(v);
      paint();
      tally();
      if (out) out.dispatchEvent(new Event('input', { bubbles: true }));
    });

    paint();
    tally();
  });

  var reviewerId = recall('pnw-decision-reviewer-id');
  if (!reviewerId) {
    reviewerId = 'r' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    remember('pnw-decision-reviewer-id', reviewerId);
  }

  var LABELS = {
    speed: 'BUILD COST: does the argument land',
    'claims.article': 'THE $500 SPONSORED ARTICLE',
    'idea.mirror': 'WOULD TRY: mirror every home in the three states',
    'idea.guide': 'WOULD TRY: the buyer and seller guide',
    'idea.parkmap': 'WOULD TRY: the park and community map',
    'idea.directory': 'WOULD TRY: the index of businesses serving the market',
    'idea.first': 'WOULD TRY: which one comes first',
    after: 'AFTER THE FIRST MONTH: the structure',
    'asm.paywall': 'ASSESSMENT: the paywall and contradicting price lists',
    'asm.identity': 'ASSESSMENT: dealership shows as seller on every listing',
    'have.year': 'DEALERS HAVE ON RECORD: year built',
    'have.sqft': 'DEALERS HAVE ON RECORD: square footage',
    'have.moved': 'DEALERS HAVE ON RECORD: must be moved',
    'have.lotrent': 'DEALERS HAVE ON RECORD: lot rent',
    terms: 'COMMERCIAL TERMS',
    'access.bd': 'ACCESS: Brilliant Directories',
    'access.dns': 'ACCESS: the domain at Namecheap',
    'story.front': 'STORY: who fronts the site',
    'story.draft': 'STORY: the draft is roughly right',
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
    'und.free': 'UNDERSTOOD: listings free for sellers and dealers',
    'und.audience': 'UNDERSTOOD: the audience is the product',
    'und.selfserve': 'UNDERSTOOD: dealers run their own inventory',
    'und.regional': 'UNDERSTOOD: MHVillage model, regional wedge',
    'und.milestones': 'UNDERSTOOD: $1,000/mo then $5,000+/mo then other regions',
    'und.overhead': 'UNDERSTOOD: low admin overhead above features',
    'und.open': 'UNDERSTOOD: not married to what is already built',
    'und.nooverbuild': 'UNDERSTOOD: do not overbuild before proving it',
    'und.previous': 'UNDERSTOOD: previous help was fee-per-task',
    'asm.platform': 'ASSESSMENT: month one on the current platform, platform question by evidence',
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
    buyerq: 'The buyer’s real question',
    'inv.dealers': 'Ben calls dealers he knows',
    'inv.import': 'Import dealer inventory from their own files',
    'inv.own': 'Load Ben’s own past and current listings',
    'inv.blocked': 'Go back to sellers who hit the paywall',
    'inv.parks': 'Parks and communities list vacant homes',
    demand: 'Who owns demand',
    'start.terms': '$500 upfront, one month',
    'plan.build': 'MONTH ONE: build the new platform rather than repair the old',
    'plan.schema': 'MONTH ONE: the model-and-dealer-offer database from day one',
    'plan.mirror': 'MONTH ONE: mirror the three states first',
    'plan.bd': 'MONTH ONE: leave Brilliant Directories untouched'
  };

  var VALUES = {
    beds: 'bedrooms', baths: 'bathrooms', sqft: 'square footage',
    width: 'single / double / triple wide', year: 'year built',
    moved: 'must be moved or stays in place', park: 'park or community name',
    county: 'county', lotrent: 'lot rent',
    will: 'I will do this', setup: 'I would if you set it up', not: 'not me',
    ok: 'that works, let us start', talk: 'wants to talk about the structure',
    number: 'wants to talk about the number', notnow: 'NOT RIGHT NOW',
    steps: 'send me the steps', call: 'do it together on a call',
    ben_front: 'the site is visibly Ben\u2019s',
    neutral: 'a neutral marketplace brand',
    afford: 'can I afford this, all-in',
    place: 'can I put it where I need it',
    condition: 'is it in decent shape',
    location: 'is it near where I need to be',
    ben: 'Ben does it',
    hire: 'Ben brings someone in',
    later: 'not settled yet / settle it at the end of month one',
    other: 'something else \u2014 see the note',
    mirror: 'mirror every home in the three states',
    guide: 'the buyer and seller guide',
    parkmap: 'the park and community map',
    directory: 'the index of businesses serving the market',
    none: 'none of them yet \u2014 homes on the site first',
    direction: 'the direction works, numbers later',
    share: 'right idea, wants to talk about the share',
    flat: 'would rather pay a flat monthly',
    changes: 'that changes how I would think about it',
    prove: 'hears it, but would rather prove it first',
    doubt: 'not convinced building is that cheap',
    pause: 'pause it until the numbers are real',
    keep: 'keep selling it'
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
      if (!field.name || !field.value.trim()) return;
      if (field.value.trim() === (field.getAttribute('data-default') || '\u0000')) return;
      lines.push(field.name.replace(/_/g, ' ') + ': ' + field.value.trim());
    });
    return lines.join('\n');
  }

  function answersText(answers) {
    return answers.map(function (a) { return a.title + '\n' + a.answer; }).join('\n\n');
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
      var r = Math.random() * 16 | 0;
      return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  // One request carries every answer. The id is fixed per set of answers, and the
  // spikes table has id as its primary key, so a retry after a lost response cannot
  // store the same answers twice. Answers send themselves: tapping a choice queues a
  // send, so nobody has to remember to press the button at the bottom of a long page.
  var submissionIds = {};
  var lastSent = recall('pnw-decision-last-sent');
  var autoTimer = null;
  var sending = false;

  // What the text message reports: how far through he is, and how much he wrote.
  // One question is one data-k group, plus each pick-three list as a single question.
  function progressCounts() {
    var total = {};
    var done = {};
    form.querySelectorAll('[data-k]').forEach(function (btn) {
      var k = btn.getAttribute('data-k');
      total[k] = true;
      if (btn.getAttribute('aria-pressed') === 'true') done[k] = true;
    });
    form.querySelectorAll('[data-pick3]').forEach(function (list) {
      var k = 'pick3:' + list.getAttribute('data-pick3');
      total[k] = true;
      if (list.querySelector('.p3[aria-pressed="true"]')) done[k] = true;
    });
    var notes = 0;
    form.querySelectorAll('textarea, input:not([type="hidden"])').forEach(function (field) {
      if (!field.name || !field.value.trim()) return;
      if (field.value.trim() === (field.getAttribute('data-default') || '\u0000')) return;
      notes++;
    });
    return { answered: Object.keys(done).length, total: Object.keys(total).length, notes: notes };
  }

  function mirrorToSpikes(spike) {
    try {
      fetch(SPIKES_ENDPOINT, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spike) })
        .catch(function () { /* best effort only */ });
    } catch (e) { /* best effort only */ }
  }

  function postAnswers(answers, name, attempt) {
    var sig = JSON.stringify([name, answers]);
    var id = submissionIds[sig] || (submissionIds[sig] = uuid());
    var spike = {
      id: id,
      type: 'page',
      projectKey: SPIKES_PROJECT,
      page: 'PNW Mobile Homes — corrections and answers',
      url: location.href,
      reviewer: { id: reviewerId, name: name },
      rating: null,
      comments: answersText(answers),
      timestamp: new Date().toISOString(),
      viewport: { width: Math.max(1, Math.round(window.innerWidth)), height: Math.max(1, Math.round(window.innerHeight)) },
      resolved: false
    };
    var payload = {
      submission_id: id,
      reviewer: { id: reviewerId, name: name },
      page: location.href,
      progress: progressCounts(),
      picks: currentPicks(),
      fields: currentFields(),
      answers: answers.map(function (a) { return { id: a.id, title: a.title, answer: a.answer }; })
    };
    if (attempt === 1) mirrorToSpikes(spike);
    return fetch(INTAKE_ENDPOINT, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) {
        if (r.ok) return sig;
        return r.text().then(function (t) {
          var err = new Error('HTTP ' + r.status + ' ' + t.slice(0, 200));
          err.retryable = r.status >= 500 || r.status === 429;
          throw err;
        });
      })
      .catch(function (err) {
        if (err.retryable === false || attempt >= 4) throw err;
        return wait(800 * attempt).then(function () { return postAnswers(answers, name, attempt + 1); });
      });
  }

  function collectAnswers() {
    return Array.prototype.slice.call(form.querySelectorAll('article[data-field]')).map(function (article) {
      var h = article.querySelector('h3');
      return { id: article.id, title: h ? h.textContent.trim() : article.id, answer: articleAnswer(article) };
    }).filter(function (a) { return a.answer; });
  }

  // The room is behind a sign-in, so we already know who this is. /api/pnw-session
  // tells us; until it answers we fall back to the room name rather than blocking.
  var whoAmI = 'Ben';
  fetch('/api/pnw-session', { headers: { 'Accept': 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j && j.who) whoAmI = j.who; })
    .catch(function () {});

  function reviewerName() { return whoAmI; }

  function unsent() {
    var answers = collectAnswers();
    if (!answers.length) return null;
    var name = reviewerName();
    if (!name) return { answers: answers, name: '' };
    return JSON.stringify([name, answers]) === lastSent ? null : { answers: answers, name: name };
  }

  // The escape hatch when the network is against us: show the answers as text they
  // can copy. A mailto: with seventy answers in the body exceeds what several mail
  // clients will open, so this is a visible box rather than a link.
  function showFallback(answers) {
    var box = document.getElementById('answers-fallback');
    if (!box) return;
    box.hidden = false;
    var ta = box.querySelector('textarea');
    if (ta) ta.value = answersText(answers);
  }

  function send(auto) {
    var pending = unsent();
    if (!pending) {
      if (!auto) {
        status.textContent = collectAnswers().length
          ? 'Already sent — I have these. Change something to send an update.'
          : 'Answer a few first.';
      }
      return Promise.resolve('nothing');
    }
    if (sending) { queueSend(1500); return Promise.resolve('busy'); }

    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    var answers = pending.answers;
    var name = pending.name;
    return postAnswers(answers, name, 1)
      .then(function (sig) {
        lastSent = sig;
        remember('pnw-decision-last-sent', sig);
        remember('pnw-decision-sent', new Date().toISOString());
        status.textContent = 'Sent. I have your answers.';
        submit.textContent = 'Sent ✓';
        flash('Saved ✓');
        return 'sent';
      })
      .catch(function (err) {
        console.error('[decisions] send failed', err);
        status.textContent = 'Not through yet. It will keep trying — or copy your answers from the box below and email them to contact@statecraft.systems.';
        flash('Not sent yet — still trying', true);
        submit.textContent = 'Send now';
        showFallback(answers);
        queueSend(20000);
        return 'failed';
      })
      .then(function (result) {
        sending = false;
        submit.disabled = false;
        refreshProgress();
        return result;
      });
  }

  // The page's whole promise is "no submit button". The only feedback used to be
  // at the very bottom of a long page, so answering anything above the fold gave
  // no signal at all — indistinguishable from broken.
  var pill = document.getElementById('save-pill');
  var pillTimer = null;
  function flash(text, sticky) {
    if (!pill) return;
    pill.textContent = text;
    pill.setAttribute('data-show', '');
    if (pillTimer) clearTimeout(pillTimer);
    if (!sticky) pillTimer = setTimeout(function () { pill.removeAttribute('data-show'); }, 2600);
  }

  function queueSend(delay) {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { autoTimer = null; send(true); }, delay);
  }

  function touched(delay) {
    refreshProgress();
    if (!unsent()) return;
    if (submit.textContent !== 'Sending…') submit.textContent = 'Send now';
    if (reviewerName()) { status.textContent = 'Saving your answers…'; flash('Saving…', true); }
    queueSend(delay);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    send(false);
  });
  form.addEventListener('click', function (event) {
    if (event.target.closest('.vote, .pick')) touched(1500);
  });
  form.addEventListener('input', function (event) {
    // The preview picker lives inside the form but is not an answer.
    if (event.target && event.target.id === 'preview-page') return;
    touched(3000);
  });

  // Closing the tab or switching away should not lose what is already answered.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && unsent() && reviewerName()) send(true);
  });

  // How far through they are. Counts a card as answered once anything in it is set.
  function refreshProgress() {
    var articles = form.querySelectorAll('article[data-field]');
    var total = articles.length;
    var done = collectAnswers().length;
    articles.forEach(function (article) {
      article.classList.toggle('is-answered', !!articleAnswer(article));
    });
    document.querySelectorAll('[data-progress]').forEach(function (el) {
      el.textContent = done === total
        ? 'All ' + total + ' answered'
        : done + ' of ' + total + ' answered';
      if (done === total) el.setAttribute('data-complete', ''); else el.removeAttribute('data-complete');
    });
  }

  refreshProgress();
  // Answers left over from a previous visit that never reached us.
  if (unsent() && reviewerName()) queueSend(2000);

  // ---------------------------------------------------------------------------
  // What has already been answered, from the record rather than from this device.
  //
  // Picks used to live only in localStorage, so the room looked blank to anyone but
  // the person who filled it in — and blank to that person on a second device. The
  // gated /api/pnw-answers returns the stored set. Your own answers are restored into
  // the form; somebody else's are shown beside each question, and never pressed, so
  // nobody overwrites anyone by tapping.
  // ---------------------------------------------------------------------------

  function dayMonth(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'][d.getMonth()];
  }

  // Keys and field names come off the wire, so they are escaped before going into a selector.
  function attr(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function groupFor(btn) {
    return btn.closest('.votes, .pick-list, .act-list li, .decision-list article') || btn.parentElement;
  }

  function markTheirPicks(picks, who) {
    var marked = 0;
    Object.keys(picks).forEach(function (k) {
      var chosen = form.querySelector('[data-k="' + attr(k) + '"][data-v="' + attr(picks[k]) + '"]');
      if (!chosen) return;
      chosen.classList.add('is-theirs');
      var group = groupFor(chosen);
      if (!group || group.querySelector(':scope > .by-them')) return;
      var badge = document.createElement('span');
      badge.className = 'by-them';
      badge.textContent = who + ': ' + prettyVal(picks[k]);
      group.appendChild(badge);
      marked++;
    });
    return marked;
  }

  function markTheirFields(fields, who) {
    Object.keys(fields).forEach(function (name) {
      var field = form.querySelector('[name="' + attr(name) + '"]');
      if (!field) return;
      var label = field.closest('label, .field-row') || field.parentElement;
      if (!label || label.querySelector(':scope > .note-them')) return;
      var note = document.createElement('div');
      note.className = 'note-them';
      var head = document.createElement('span');
      head.className = 'note-them-who';
      head.textContent = who + ' wrote';
      var body = document.createElement('p');
      body.textContent = fields[name];
      note.appendChild(head);
      note.appendChild(body);
      label.insertAdjacentElement('afterend', note);
    });
  }

  function restoreOwn(record) {
    var picks = loadPicks();
    var added = 0;
    Object.keys(record.picks || {}).forEach(function (k) {
      if (picks[k] === undefined) { picks[k] = record.picks[k]; added++; }
    });
    if (added) { savePicks(picks); applyPicks(picks); }
    Object.keys(record.fields || {}).forEach(function (name) {
      var field = form.querySelector('[name="' + attr(name) + '"]');
      if (field && !field.value.trim()) {
        field.value = record.fields[name];
        remember('pnw-decision-' + name, field.value);
        added++;
      }
    });
    if (added) refreshProgress();
    return added;
  }

  function announce(text) {
    var bar = document.getElementById('answers-on-record');
    if (!bar) {
      bar = document.createElement('p');
      bar.id = 'answers-on-record';
      bar.className = 'on-record';
      form.insertBefore(bar, form.firstChild);
    }
    bar.textContent = text;
  }

  fetch('/api/pnw-answers', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.latest || !data.latest.length) return;
      data.latest.forEach(function (record) {
        var them = (record.reviewer && record.reviewer.name) || 'someone';
        var when = dayMonth(record.received_at);
        var picked = Object.keys(record.picks || {}).length;
        var count = (record.progress && record.progress.answered) || picked;
        if (!picked && !Object.keys(record.fields || {}).length) return;
        if (data.who && them.toLowerCase() === String(data.who).toLowerCase()) {
          restoreOwn(record);
          announce('Your answers from ' + when + ' are on record — ' + count
            + (record.progress && record.progress.total ? ' of ' + record.progress.total : '') + ' answered.');
        } else {
          markTheirPicks(record.picks || {}, them);
          markTheirFields(record.fields || {}, them);
          announce(them + ' answered ' + count
            + (record.progress && record.progress.total ? ' of ' + record.progress.total : '')
            + ' on ' + when + '. Their answers are marked below.');
        }
      });
    })
    .catch(function () { /* the room works without it */ });
})();
