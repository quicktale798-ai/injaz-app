/* ============================================================
   INJAZ — Service Worker
   إنجاز — نظام إدارة حياتك
   ============================================================ */

const CACHE_NAME = 'injaz-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Don't fail install if some assets missing
      });
    })
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch — Network first, fallback to cache ─────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return; // Don't cache API

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || '⚡ إنجاز';
  const options = {
    body: data.body || 'لديك تذكير جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'injaz-notif',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '📋 فتح' },
      { action: 'dismiss', title: '✕ إغلاق' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ── Background Sync (task reminders) ─────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'task-reminder') {
    event.waitUntil(checkTaskReminders());
  }
});

async function checkTaskReminders() {
  // This would check stored tasks and send notifications
  // Currently handled by the main app when open
}

// ── Message from app ──────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title || '⚡ إنجاز', {
      body: body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: tag || 'injaz',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '📋 فتح التطبيق' },
        { action: 'dismiss', title: '✕' }
      ]
    });
  }
});
