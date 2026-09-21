(function () {
  var select = document.getElementById('preview-version');
  var preview = document.getElementById('site-preview');
  var link = document.getElementById('open-preview');
  if (select && preview && link) {
    select.addEventListener('change', function () {
      var path = '/prosser/versions/' + select.value + '/';
      preview.src = path + 'index.html';
      preview.title = 'Prosser Home website preview, ' + select.options[select.selectedIndex].text;
      link.href = path;
    });
  }

  // Answers go to Moritz's Zo, which stores them before replying and texts him.
  // (Spikes is only used for the on-page comment widget.)
  var INTAKE_ENDPOINT = 'https://bierlingm.zo.space/api/prosser/answers';
  var PICKS_KEY = 'prosser-picks';
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
    var saved = recall('prosser-decision-' + field.name);
    if (saved) field.value = saved;
    field.addEventListener('input', function () { remember('prosser-decision-' + field.name, field.value); });
  });
  if (nameField) {
    nameField.value = recall('prosser-decision-reviewer');
    nameField.addEventListener('input', function () { remember('prosser-decision-reviewer', nameField.value); });
  }

  var reviewerId = recall('prosser-decision-reviewer-id');
  if (!reviewerId) {
    reviewerId = 'r' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    remember('prosser-decision-reviewer-id', reviewerId);
  }

  var LABELS = {
    'facts.suite': 'Call upstairs a suite',
    'facts.family': 'Treat as family-friendly',
    'facts.mattresses': 'Mattresses still need work',
    'facts.wifi': 'Wi-Fi still a problem',
    'facts.lateCheckout': 'Late checkout on request',
    'facts.soap': 'Unscented soap in each bath',
    'facts.table8': 'Dining table already seats 8',
    'photos.keep': 'Keep listing photos',
    'photos.new': 'New daylight of suites / kitchen / patio',
    'quotes.tina': 'Tina (game room)',
    'quotes.janine': 'Janine (Balloon Rally)',
    'quotes.esteban': 'Esteban (layout)',
    'quotes.diane': 'Diane (group of 8)',
    'quotes.hugo': 'Hugo (last-minute)',
    'quotes.steve': 'Steve (Vintners Village)',
    'stories.wine': 'Wine country',
    'stories.families': 'Two families',
    'stories.eight': 'Group of eight',
    'stories.rally': 'Balloon Rally',
    'stories.girls': 'Girls’ weekends',
    'stories.wedding': 'Wedding overflow',
    'stories.thanksgiving': 'Thanksgiving',
    'stories.lastminute': 'Last-minute stays',
    'stories.conference': 'Conferences',
    'local.vintners': 'Vintners Village',
    'local.mercer': 'Mercer',
    'local.wit': 'WIT Cellars',
    'local.brewminatti': 'Brewminatti',
    'local.saloon': 'Horse Heaven Saloon',
    'local.chukar': 'Chukar Cherries',
    'local.market': 'Farmers Market',
    'local.kiona': 'Kiona Vineyards',
    'local.fidelitas': 'Fidélitas',
    'local.milbrandt': 'Milbrandt Vineyards',
    'local.redmountain': 'Red Mountain AVA',
    'local.rally': 'Balloon Rally (Explore)',
    'booking.venmoPersonal': 'Keep personal Venmo (@TJ-SAB)',
    'booking.venmoPurchase': 'Ask guests to mark Venmo as a purchase',
    'booking.paypal': 'Also offer PayPal',
    'booking.discount': 'Discount versus Airbnb',
    'ops.sms': 'SMS at launch',
    'ops.phone': 'Phone',
    domain: 'Domain'
  };

  function prettyVal(v) {
    if (v === 'yes' || v === 'keep' || v === 'add') return 'yes';
    if (v === 'no' || v === 'drop' || v === 'skip') return 'no';
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
    return 'mailto:contact@statecraft.systems?subject=' + encodeURIComponent('Prosser Home decisions' + (name ? ' from ' + name : ''))
      + '&body=' + encodeURIComponent(lines.join('\n\n'));
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
      var r = Math.random() * 16 | 0;
      return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  // One request carries every answer. The submission id is fixed per set of answers,
  // so a retry after a lost response is recognised by the server and not stored twice.
  // Answers send themselves: tapping a choice queues a send, so nobody has to remember
  // to press the button. The button still works, and still says what state we are in.
  var submissionIds = {};
  var lastSent = recall('prosser-decision-last-sent');
  var autoTimer = null;
  var sending = false;

  function postAnswers(answers, name, attempt) {
    var sig = JSON.stringify([name, answers]);
    var id = submissionIds[sig] || (submissionIds[sig] = uuid());
    var payload = {
      submission_id: id,
      reviewer: { id: reviewerId, name: name },
      page: location.href,
      answers: answers.map(function (a) { return { id: a.id, title: a.title, answer: a.answer }; })
    };
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

  function reviewerName() { return nameField ? nameField.value.trim() : ''; }

  function unsent() {
    var answers = collectAnswers();
    if (!answers.length) return null;
    var name = reviewerName();
    if (!name) return { answers: answers, name: '' };
    return JSON.stringify([name, answers]) === lastSent ? null : { answers: answers, name: name };
  }

  // auto = queued by a tap; manual = they pressed the button.
  function send(auto) {
    var pending = unsent();
    if (!pending) {
      if (!auto) {
        status.textContent = collectAnswers().length
          ? 'Already sent — we have these answers. Change something to send an update.'
          : 'Tap a few ✓ / ✕ first.';
      }
      return Promise.resolve('nothing');
    }
    if (!pending.name) {
      status.textContent = 'Add your name at the top of this box — then your answers send themselves.';
      if (!auto && nameField) nameField.focus();
      return Promise.resolve('no-name');
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
        remember('prosser-decision-last-sent', sig);
        remember('prosser-decision-sent', new Date().toISOString());
        status.textContent = 'Sent. ' + answers.length + (answers.length === 1 ? ' answer' : ' answers') + ' reached us.';
        submit.textContent = 'Sent ✓';
        return 'sent';
      })
      .catch(function (err) {
        console.error('[decisions] send failed', err);
        var detail = err && err.message ? ' (' + String(err.message).replace(/[<>&]/g, '') + ')' : '';
        status.innerHTML = 'Not through yet' + detail + '. It will keep trying — or <a href="' + mailtoFor(answers, name).replace(/"/g, '&quot;') + '">send the answers by email instead</a>.';
        submit.textContent = 'Send these answers ↗';
        queueSend(20000);
        return 'failed';
      })
      .then(function (result) {
        sending = false;
        submit.disabled = false;
        return result;
      });
  }

  function queueSend(delay) {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { autoTimer = null; send(true); }, delay);
  }

  // Called whenever an answer changes, so the button never claims "Sent ✓" for
  // answers we have not actually sent yet.
  function touched(delay) {
    if (!unsent()) return;
    if (submit.textContent !== 'Sending…') submit.textContent = 'Send these answers ↗';
    if (reviewerName()) status.textContent = 'Saving your answers…';
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
  form.addEventListener('input', function () { touched(3000); });

  // Leaving the page with something queued: send it now rather than lose it.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
      send(true);
    }
  });

  // Answers tapped in an earlier visit and never sent are still in this browser.
  // Send them on load so they cannot sit here unnoticed.
  if (unsent()) touched(800);
})();
