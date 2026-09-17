/* ============================================================
   sw.js — Service Worker для Ink
   Принимает push и показывает уведомление
   ============================================================ */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){}

  const title = data.title || 'Ink';
  const options = {
    body: data.body || 'Новое сообщение',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.chatId ? ('ink-chat-' + data.chatId) : 'ink',
    renotify: true,
    data: {
      url: data.url || 'https://ink-chat.ru/web.html',
      chatId: data.chatId || null
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || 'https://ink-chat.ru/web.html';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(clientList => {
      for(const c of clientList){
        if(c.url.includes('ink-chat.ru') && 'focus' in c){
          c.focus();
          c.postMessage({ type:'open-chat', chatId: (event.notification.data || {}).chatId });
          return;
        }
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'skip-waiting'){
    self.skipWaiting();
  }
});