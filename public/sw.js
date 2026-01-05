// Service Worker for Web Push Notifications
// This runs in the background and can receive push events even when the browser is closed

const CACHE_NAME = 'edupay-push-v1';

// Install event - called when the service worker is first installed
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - called when the service worker becomes active
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
});

// Push event - called when a push notification is received from the server
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'EduPay Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'edupay-notification',
    requireInteraction: false,
    data: {}
  };

  // Parse the push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || notificationData.requireInteraction,
        data: data.data || {}
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
      // Try to use text data as body
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Show the notification
  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    vibrate: [200, 100, 200],
    data: notificationData.data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });

  event.waitUntil(promiseChain);
});

// Notification click event - called when user clicks on a notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }

  // Get the URL to open (default to root)
  const urlToOpen = event.notification.data?.url || '/';

  // Open or focus the app window
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    // Check if there's already a window open
    for (const client of windowClients) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(urlToOpen);
        return client.focus();
      }
    }
    // If no window is open, open a new one
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// Notification close event - called when user dismisses notification
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);
});
