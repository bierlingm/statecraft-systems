/* The Prosser House — nav, gallery lightbox, availability calendar, request form. No dependencies. */
(function () {
  'use strict';

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---- Lightbox ---- */
  var gallery = document.getElementById('gallery');
  var lb = document.getElementById('lightbox');
  if (gallery && lb) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var img = lb.querySelector('img');
    var cap = lb.querySelector('.lightbox__caption');
    var idx = 0;
    var previousFocus;
    function show(i) {
      var opening = !lb.classList.contains('is-open');
      if (opening) previousFocus = document.activeElement;
      idx = (i + links.length) % links.length;
      img.src = links[idx].getAttribute('href');
      img.alt = links[idx].querySelector('img').alt;
      cap.textContent = links[idx].dataset.caption || '';
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (opening) lb.querySelector('.lightbox__close').focus();
    }
    function hide() {
      lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previousFocus) previousFocus.focus();
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', hide);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Tab') {
        var buttons = Array.prototype.slice.call(lb.querySelectorAll('button'));
        var next = (buttons.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
        e.preventDefault(); buttons[next].focus();
      }
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---- Date helpers (local-midnight Date objects <-> YYYY-MM-DD strings) ---- */
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fromIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmt(d) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }

  /* ---- Availability calendar ---- */
  var calEl = document.getElementById('calendar');
  if (calEl) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var view = new Date(today.getFullYear(), today.getMonth(), 1);
    var booked = {};          // iso -> true for nights that are unavailable
    var checkin = null, checkout = null;
    var status = document.getElementById('cal-status');
    var MIN_NIGHTS = 2;

    function isBooked(d) { return !!booked[iso(d)]; }

    function render() {
      calEl.innerHTML = '';
      var months = window.innerWidth < 640 ? 1 : 2;
      var last;
      for (var m = 0; m < months; m++) {
        var mDate = new Date(view.getFullYear(), view.getMonth() + m, 1);
        last = mDate;
        calEl.appendChild(renderMonth(mDate));
      }
      document.getElementById('cal-range').textContent =
        view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) +
        (months > 1 ? ' – ' + last.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '');
      document.getElementById('cal-prev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
      updatePanel();
    }

    function renderMonth(mDate) {
      var box = document.createElement('div'); box.className = 'cal-month';
      var h = document.createElement('h3'); h.textContent = mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); box.appendChild(h);
      var grid = document.createElement('div'); grid.className = 'cal-grid';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { var e = document.createElement('div'); e.className = 'cal-dow'; e.textContent = d; grid.appendChild(e); });
      for (var i = 0; i < mDate.getDay(); i++) grid.appendChild(document.createElement('div'));
      var days = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= days; d++) {
        var date = new Date(mDate.getFullYear(), mDate.getMonth(), d);
        var b = document.createElement('button'); b.type = 'button'; b.className = 'cal-day'; b.textContent = d;
        b.dataset.date = iso(date);
        var past = date < today;
        var bk = isBooked(date);           // the night starting on this date is taken
        var prevBk = isBooked(addDays(date, -1));
        if (past) { b.classList.add('is-past'); b.disabled = true; }
        if (bk) { b.classList.add('is-booked'); }
        // A date whose own night is booked can still be a check-OUT day if the previous night is free
        // and we're currently picking a check-out. Otherwise booked nights are not clickable.
        var pickingOut = checkin && !checkout;
        if (bk && !(pickingOut && !prevBk && date > checkin)) b.disabled = true;
        if (iso(date) === iso(today)) b.classList.add('is-today');
        if (checkin && checkout && date > checkin && date < checkout) b.classList.add('in-range');
        if (checkin && iso(date) === iso(checkin)) b.classList.add('is-start');
        if (checkout && iso(date) === iso(checkout)) b.classList.add('is-end');
        b.addEventListener('click', onDayClick);
        grid.appendChild(b);
      }
      box.appendChild(grid);
      return box;
    }

    function rangeIsFree(a, b) { // nights a .. b-1 must all be free
      for (var d = new Date(a); d < b; d = addDays(d, 1)) if (isBooked(d)) return false;
      return true;
    }

    function onDayClick(e) {
      var date = fromIso(e.currentTarget.dataset.date);
      if (!checkin || (checkin && checkout) || date <= checkin) {
        if (isBooked(date)) return;
        checkin = date; checkout = null;
        setStatus('Now pick a check-out date.');
      } else {
        var nights = Math.round((date - checkin) / 86400000);
        if (nights < MIN_NIGHTS) { setStatus('Stays are a minimum of ' + MIN_NIGHTS + ' nights.'); return; }
        if (!rangeIsFree(checkin, date)) { setStatus('Those dates overlap a booking. Try a different range.'); return; }
        checkout = date;
        setStatus(nights + ' nights selected.');
      }
      render();
    }

    function setStatus(t) { if (status) status.textContent = t; }

    function updatePanel() {
      var nights = checkin && checkout ? Math.round((checkout - checkin) / 86400000) : null;
      document.getElementById('sel-in').textContent = checkin ? fmt(checkin) : '—';
      document.getElementById('sel-out').textContent = checkout ? fmt(checkout) : '—';
      document.getElementById('sel-nights').textContent = nights ? nights : '—';
      var req = document.getElementById('btn-request');
      var ab = document.getElementById('btn-airbnb');
      var base = ab.dataset.base || ab.getAttribute('href');
      ab.dataset.base = base;
      if (checkin && checkout) {
        req.href = '/prosser/versions/v0-2/contact?checkin=' + iso(checkin) + '&checkout=' + iso(checkout);
        var u = new URL(base);
        u.searchParams.set('check_in', iso(checkin)); u.searchParams.set('check_out', iso(checkout));
        ab.href = u.toString();
      } else {
        req.href = '/prosser/versions/v0-2/contact'; ab.href = base;
      }
    }

    document.getElementById('cal-prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
    document.getElementById('cal-next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 150); });

    render();
    Promise.resolve({ok:true,json:function(){return Promise.resolve({source:'demo',booked:[]});}})
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        booked = {};
        (data.booked || []).forEach(function (rng) {
          // ranges are [start, end): nights from start up to, but not including, end
          for (var d = fromIso(rng.start); d < fromIso(rng.end); d = addDays(d, 1)) booked[iso(d)] = true;
        });
        if (data.airbnbUrl) { var ab = document.getElementById('btn-airbnb'); ab.dataset.base = data.airbnbUrl; ab.href = data.airbnbUrl; }
        var when = data.updated ? new Date(data.updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
        setStatus(data.source === 'airbnb'
          ? 'Synced with our Airbnb calendar' + (when ? ' · updated ' + when : '') + '.'
          : 'Preview calendar only — these dates do not show availability. Check Airbnb for real dates.');
        render();
      })
      .catch(function () { setStatus('Couldn\'t load live availability. Please send us a request and we\'ll confirm.'); });
  }

  /* ---- Request form ---- */
  var form = document.getElementById('request-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get('checkin')) form.checkin.value = params.get('checkin');
    if (params.get('checkout')) form.checkout.value = params.get('checkout');
    var statusEl = document.getElementById('form-status');
    var submit = document.getElementById('form-submit');
    submit.disabled = true; submit.textContent = 'Preview only';
    statusEl.textContent = 'This form is a design preview and does not send requests. Use the Airbnb link to contact the hosts.'; statusEl.classList.add('is-visible');
    form.addEventListener('submit', function(e) { e.preventDefault(); });
    return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.className = 'form__status';
      if (!form.name.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value)) {
        statusEl.textContent = 'Please add your name and a valid email address.';
        statusEl.classList.add('is-visible', 'is-error'); return;
      }
      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      payload.page = location.href;
      submit.disabled = true; submit.textContent = 'Sending…';
      fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.body.error || 'Request failed');
          statusEl.textContent = 'Thanks, ' + form.name.value.trim().split(' ')[0] + '! Your request is in. We\'ll reply within a day.';
          statusEl.classList.add('is-visible');
          form.reset(); submit.textContent = 'Sent';
        })
        .catch(function (err) {
          statusEl.textContent = 'Something went wrong (' + err.message + '). Please message us through the Airbnb link on this page.';
          statusEl.classList.add('is-visible', 'is-error');
          submit.disabled = false; submit.textContent = 'Send request';
        });
    });
  }
})();
