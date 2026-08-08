/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Client glue, shared by the landing page and the app shell. Deliberately
 * small: htmx owns the interaction model, and this file only handles the
 * things that are genuinely the app's own business — the service worker
 * lifecycle, the install prompt, the evidence panel, and the few in-page
 * behaviors too small to warrant a hypermedia round-trip.
 */

(function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };

  /* ---------------- service worker ---------------- */

  var reloading = false;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          reg.addEventListener('updatefound', function () {
            var incoming = reg.installing;
            if (!incoming) return;
            incoming.addEventListener('statechange', function () {
              if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
                offerUpdate(incoming);
              }
            });
          });
        })
        .catch(function (err) {
          toast('Service worker did not register: ' + err.message);
        });

      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });
    });
  } else {
    toast('This browser has no service worker. The app cannot run offline here.');
  }

  function offerUpdate(worker) {
    toast('A new version is ready.', 'Use it', function () {
      worker.postMessage('skip-waiting');
    });
  }

  /* ---------------- toast ---------------- */

  function toast(message, actionLabel, onAction) {
    var el = $('#toast');
    if (!el) return;
    el.innerHTML = '';
    el.appendChild(document.createTextNode(message));
    if (actionLabel) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = actionLabel;
      b.addEventListener('click', function () { el.hidden = true; onAction(); });
      el.appendChild(b);
    }
    el.hidden = false;
    if (!actionLabel) setTimeout(function () { el.hidden = true; }, 4000);
  }

  /* ---------------- network pill ---------------- */

  function paintNetwork() {
    var pill = $('#net-pill');
    var text = $('#net-pill-text');
    if (!pill || !text) return;
    if (navigator.onLine) {
      pill.dataset.state = 'online';
      text.textContent = 'Network available';
    } else {
      pill.dataset.state = 'offline';
      text.textContent = 'No network — still running';
    }
  }

  window.addEventListener('online', paintNetwork);
  window.addEventListener('offline', paintNetwork);
  paintNetwork();

  /* ---------------- install prompt ---------------- */

  var deferredPrompt = null;
  var installBtn = $('#install');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installBtn.hidden = true;
      });
    });
  }

  window.addEventListener('appinstalled', function () {
    if (installBtn) installBtn.hidden = true;
    toast('Installed. Stop the server and open it from your launcher.');
  });

  /* ---------------- composer reset (was a hyperscript one-liner) ---------------- */

  var composer = $('.composer');
  if (composer) {
    composer.addEventListener('htmx:afterRequest', function () {
      var input = $('#note-input');
      if (!input) return;
      input.value = '';
      input.focus();
    });
  }

  /* ---------------- ledger clear (was a hyperscript one-liner) ---------------- */

  var ledgerClear = $('#ledger-clear');
  if (ledgerClear) {
    ledgerClear.addEventListener('click', function () {
      var rows = $('#ledger-rows');
      var ledger = $('#ledger');
      if (rows) rows.innerHTML = '';
      if (ledger) ledger.removeAttribute('data-count');
    });
  }

  /* ---------------- disclosure toggle (was a hyperscript one-liner) ---------------- */

  var aboutUpdatesToggle = $('#about-updates-toggle');
  if (aboutUpdatesToggle) {
    aboutUpdatesToggle.addEventListener('click', function () {
      var help = $('#update-help');
      if (help) help.classList.toggle('is-open');
    });
  }

  /* ---------------- request ledger ---------------- */

  var started = new Map();
  var count = 0;

  document.body.addEventListener('htmx:beforeRequest', function (evt) {
    started.set(evt.detail.xhr, performance.now());
  });

  document.body.addEventListener('htmx:afterRequest', function (evt) {
    var xhr = evt.detail.xhr;
    var began = started.get(xhr);
    started.delete(xhr);

    var ms = began ? Math.round(performance.now() - began) : null;
    var cfg = evt.detail.requestConfig || {};
    var by = xhr.getResponseHeader('X-Served-By') || 'network';

    addLedgerRow({
      verb: (cfg.verb || 'get').toUpperCase(),
      path: cfg.path || '(unknown)',
      by: by,
      ms: ms
    });
  });

  function addLedgerRow(entry) {
    var rows = $('#ledger-rows');
    if (!rows) return;
    var row = document.createElement('div');
    row.className = 'ledger__row ledger__row--entry';
    row.setAttribute('role', 'row');

    var fromNetwork = entry.by === 'network';

    row.innerHTML =
      '<span>' + new Date().toLocaleTimeString([], { hour12: false }) + '</span>' +
      '<span><span class="ledger__method">' + escape_(entry.verb) + '</span> ' +
        escape_(entry.path) + '</span>' +
      '<span class="ledger__by' + (fromNetwork ? ' ledger__by--network' : '') + '">' +
        escape_(entry.by) + '</span>' +
      '<span>' + (entry.ms == null ? '—' : entry.ms + ' ms') + '</span>';

    rows.insertBefore(row, rows.firstChild);
    while (rows.children.length > 40) rows.removeChild(rows.lastChild);

    count += 1;
    var ledgerEl = $('.ledger');
    if (ledgerEl) ledgerEl.setAttribute('data-count', String(count));
  }

  function escape_(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- network proof ----------------
     transferSize of 0 means the browser pulled the resource from a
     cache or the service worker rather than the wire. On a first
     visit these will be non-zero; on every visit after, they should
     all be zero. That is the whole claim, measured rather than
     asserted.                                                      */

  function paintNetworkProof() {
    var slot = $('#network-proof');
    if (!slot || !window.performance || !performance.getEntriesByType) return;

    var entries = performance.getEntriesByType('resource').filter(function (e) {
      return e.name.indexOf(location.origin) === 0;
    });
    if (!entries.length) return;

    var bytes = entries.reduce(function (sum, e) { return sum + (e.transferSize || 0); }, 0);
    var free = entries.filter(function (e) { return (e.transferSize || 0) === 0; }).length;

    slot.textContent = free + ' of ' + entries.length +
      ' resources loaded without touching the network (' +
      (bytes === 0 ? '0 bytes' : (bytes / 1024).toFixed(1) + ' KB') + ' transferred).';
  }

  document.body.addEventListener('htmx:afterSwap', paintNetworkProof);

  /* ---------------- keyboard ---------------- */

  document.addEventListener('keydown', function (e) {
    var input = $('#note-input');
    if (!input) return;
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });

  /* ---------------- footer ---------------- */

  var scope = $('#foot-scope');
  if (scope) {
    scope.textContent = location.origin +
      (window.matchMedia('(display-mode: standalone)').matches ? ' · installed' : ' · in browser');
  }

})();
