(function () {
  var select = document.getElementById('preview-version');
  var preview = document.getElementById('site-preview');
  var link = document.getElementById('open-preview');
  select.addEventListener('change', function () {
    var path = '/prosser/versions/' + select.value + '/';
    preview.src = path;
    preview.title = 'Prosser Home website preview, ' + select.options[select.selectedIndex].text;
    link.href = path;
  });

  // Decision answers are saved in this browser as you type, and on "Send" each answered
  // question is posted to the same Spikes store that holds the design comments
  // (project key "yvs", page "Prosser Home decisions"). Email is the fallback.
  var SPIKES_ENDPOINT = 'https://spikes.sh/spikes';
  var SPIKES_PROJECT = 'yvs';
  var form = document.getElementById('decision-form');
  var status = document.getElementById('decision-status');
  if (!form) return;

  var fields = Array.prototype.slice.call(form.querySelectorAll('textarea'));
  var nameField = form.querySelector('input[name="reviewer"]');
  var submit = form.querySelector('button[type="submit"]');

  function remember(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }
  function recall(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }

  fields.forEach(function (field) {
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

  function questionFor(field) {
    var article = field.closest('article');
    var h = article && article.querySelector('h3');
    return { id: article ? article.id : field.name, title: h ? h.textContent.trim() : field.name };
  }

  function mailtoFor(answers, name) {
    var lines = answers.map(function (a) { return a.title + '\n' + a.answer; });
    return 'mailto:contact@statecraft.systems?subject=' + encodeURIComponent('Prosser Home decisions' + (name ? ' from ' + name : ''))
      + '&body=' + encodeURIComponent(lines.join('\n\n'));
  }

  function postSpike(answer, name) {
    var spike = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      type: 'page',
      projectKey: SPIKES_PROJECT,
      page: 'Prosser Home decisions',
      url: location.origin + '/prosser/#' + answer.id,
      reviewer: { id: reviewerId, name: name },
      rating: null,
      comments: answer.title + '\n\n' + answer.answer,
      timestamp: new Date().toISOString(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      resolved: false
    };
    return fetch(SPIKES_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spike) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = nameField ? nameField.value.trim() : '';
    var answers = fields.map(function (f) {
      var q = questionFor(f);
      return { id: q.id, title: q.title, answer: f.value.trim() };
    }).filter(function (a) { return a.answer; });

    if (!name) { status.textContent = 'Add your name so we know who answered.'; if (nameField) nameField.focus(); return; }
    if (!answers.length) { status.textContent = 'Write at least one answer first.'; return; }

    submit.disabled = true; submit.textContent = 'Sending…';
    status.textContent = '';
    Promise.all(answers.map(function (a) { return postSpike(a, name); }))
      .then(function () {
        status.textContent = 'Sent. ' + answers.length + (answers.length === 1 ? ' answer' : ' answers') + ' reached us. Your text stays here in case you want to add to it later.';
        submit.textContent = 'Sent ✓';
        remember('prosser-decision-sent', new Date().toISOString());
      })
      .catch(function () {
        status.innerHTML = 'That didn’t go through. <a href="' + mailtoFor(answers, name).replace(/"/g, '&quot;') + '">Send the answers by email instead</a>.';
        submit.disabled = false; submit.textContent = 'Send these answers ↗';
      });
  });
})();
