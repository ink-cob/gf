// sw-push.js
self.addEventListener('push', function(event) {
  let data = { title: 'Ink', body: 'Новое уведомление', url: '/web.html' };
  if (event.data) {
    try { data = Object.assign(data, event.data.json()); } catch (e) { data.body = event.data.text(); }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('web.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url || '/web.html');
    })
  );
});