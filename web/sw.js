/*
 * SPDX-License-Identifier: MIT
 * @author Andrew Velez
 * Link-Up service worker.
 *
 * Two jobs:
 *   1. Precache the whole shell so the app never needs the network again.
 *   2. Act as the local hypermedia server for /api/* — parse the request,
 *      read or write IndexedDB, and answer with an HTML fragment for htmx.
 */

const VERSION = 'v1';
const CACHE = `link-up-${VERSION}`;

const SHELL = [
  '/',
  '/index.html',
  '/app.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/vendor/htmx.min.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/favicon-64.png'
];

/* ---------------- lifecycle ---------------- */

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // reload: bypass the HTTP cache so a version bump always gets fresh bytes
    await cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith('link-up-') && n !== CACHE)
           .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

/* ---------------- fetch routing ---------------- */

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;      // nothing else exists

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApi(req, url));
    return;
  }

  event.respondWith(serveFromCache(req));
});

async function serveFromCache(req) {
  const cache = await caches.open(CACHE);

  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;

  // Any unrecognized in-scope navigation resolves to the landing page.
  if (req.mode === 'navigate') {
    const shell = await cache.match('/index.html');
    if (shell) return shell;
  }

  try {
    return await fetch(req);
  } catch {
    return new Response('Offline and not in cache.', {
      status: 504,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/* ---------------- IndexedDB ---------------- */

const DB_NAME = 'link-up';
const DB_VERSION = 1;
const STORE = 'notes';

function openDB() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

function run(mode, fn) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

const allNotes   = ()     => run('readonly',  (s) => s.getAll());
const putNote    = (note) => run('readwrite', (s) => s.put(note));
const deleteNote = (id)   => run('readwrite', (s) => s.delete(id));

/* ---------------- fragment rendering ---------------- */

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function clock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderNotes(notes) {
  if (!notes.length) {
    return `<p class="empty">Nothing saved yet. Whatever you write stays on this
            device — it is not sent anywhere, because there is nowhere to send it.</p>`;
  }
  return notes
    .sort((a, b) => b.ts - a.ts)
    .map((n) => `
      <div class="note">
        <span class="note__time">${esc(clock(n.ts))}</span>
        <span class="note__text">${esc(n.text)}</span>
        <button class="note__del" title="Delete note" aria-label="Delete note"
                hx-delete="/api/notes/${encodeURIComponent(n.id)}"
                hx-target="#notes" hx-swap="innerHTML">&times;</button>
      </div>`)
    .join('');
}

async function renderDiagnostics() {
  const cache = await caches.open(CACHE);
  const keys = await cache.keys();
  const notes = await allNotes();

  let quota = 'not reported';
  try {
    const est = await self.navigator.storage.estimate();
    if (est && est.usage != null) {
      quota = `${(est.usage / 1024).toFixed(1)} KB used`;
      if (est.quota) quota += ` of ~${(est.quota / 1024 / 1024).toFixed(0)} MB available`;
    }
  } catch { /* StorageManager not available */ }

  const rows = [
    ['Answered by',       `<span class="ok">service worker ${esc(VERSION)}</span>`],
    ['Origin',            esc(self.location.origin)],
    ['Cache name',        esc(CACHE)],
    ['Files precached',   `${keys.length} — the entire app`],
    ['Local database',    `${esc(DB_NAME)} · ${notes.length} note${notes.length === 1 ? '' : 's'}`],
    ['Storage',           esc(quota)],
    ['Generated at',      esc(new Date().toLocaleTimeString())]
  ];

  return `<dl class="readout">
    ${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}
  </dl>
  <p id="network-proof" class="hint" style="margin-top:.9rem"></p>`;
}

/* ---------------- the API ---------------- */

function fragment(html, extraHeaders) {
  return new Response(html, {
    status: 200,
    headers: Object.assign({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Served-By': 'service worker'
    }, extraHeaders || {})
  });
}

async function handleApi(req, url) {
  const path = url.pathname;

  try {
    if (path === '/api/diagnostics' && req.method === 'GET') {
      return fragment(await renderDiagnostics());
    }

    if (path === '/api/notes' && req.method === 'GET') {
      return fragment(renderNotes(await allNotes()));
    }

    if (path === '/api/notes' && req.method === 'POST') {
      const form = await req.formData();
      const text = (form.get('text') || '').toString().trim().slice(0, 140);
      if (text) {
        await putNote({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text,
          ts: Date.now()
        });
      }
      return fragment(renderNotes(await allNotes()), {
        'HX-Trigger': 'refresh-diagnostics'
      });
    }

    const del = path.match(/^\/api\/notes\/(.+)$/);
    if (del && req.method === 'DELETE') {
      await deleteNote(decodeURIComponent(del[1]));
      return fragment(renderNotes(await allNotes()), {
        'HX-Trigger': 'refresh-diagnostics'
      });
    }

    return fragment(
      `<p class="empty">No local route for <code>${esc(req.method)} ${esc(path)}</code>.</p>`,
      { 'X-Served-By': 'service worker (no route)' }
    );
  } catch (err) {
    return fragment(
      `<p class="empty">The local database refused that: ${esc(err && err.message || err)}</p>`,
      { 'X-Served-By': 'service worker (error)' }
    );
  }
}
