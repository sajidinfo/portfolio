const CACHE_NAME = 'shred-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/manifest.json',
  './assets/icon.svg',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ===== Notification show helper =====
function showSlotNotification(slot) {
  return self.registration.showNotification(slot.title || '90 DAY SHRED', {
    body: slot.body || '',
    icon: 'assets/icon.svg',
    badge: 'assets/icon.svg',
    tag: slot.tag || 'shred-slot',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: './', slotId: slot.id }
  });
}

// Page se direct schedule (foreground) ya immediate notify
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION' && data.slot) {
    event.waitUntil(showSlotNotification(data.slot));
  }
});

// Notification click — app khol do (ya focus karo agar already khulli hai)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) return w.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// Periodic background sync — agle ghante ke slots check karke notify
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'shred-check-slots') {
    event.waitUntil(checkDueSlots());
  }
});

async function checkDueSlots() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match('shred-schedule');
    if (!res) return;
    const slots = await res.json();
    const now = Date.now();
    const due = [];
    const remaining = [];
    for (const s of slots) {
      if (s.fireAt <= now && now - s.fireAt < 10 * 60 * 1000) {
        due.push(s);
      } else if (s.fireAt > now) {
        remaining.push(s);
      }
    }
    for (const s of due) {
      await showSlotNotification(s);
    }
    if (due.length) {
      await cache.put('shred-schedule', new Response(JSON.stringify(remaining), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  } catch (e) {
    // silent
  }
}
