const CACHE_NAME = "cashlytics-v2.4";
const urlsToCache = [
  "/cashlytics-web-app/",
  "/cashlytics-web-app/index.html",
  "/cashlytics-web-app/manifest.json",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://apis.google.com/js/api.js"
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log("Cache install failed:", error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // For navigation requests (like opening the PWA), always try index.html
        if (event.request.mode === "navigate" || 
            event.request.destination === "document" ||
            event.request.headers.get('accept').includes('text/html')) {
          
          // Try to fetch the requested URL first
          return fetch(event.request).catch(() => {
            // If that fails, serve index.html from cache
            return caches.match("/cashlytics-web-app/index.html").then((cachedIndex) => {
              if (cachedIndex) {
                return cachedIndex;
              }
              // Final fallback - try to fetch index.html
              return fetch("/cashlytics-web-app/index.html");
            });
          });
        }

        // For other requests, try network first
        return fetch(event.request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page for documents
        if (
          event.request.destination === "document" ||
          event.request.mode === "navigate" ||
          event.request.headers.get('accept').includes('text/html')
        ) {
          return caches.match("/cashlytics-web-app/index.html");
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle app shortcuts
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/cashlytics-web-app/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes("cashlytics-web-app") && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync for data backup
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // This would handle background data sync in the future
      console.log("Background sync triggered")
    );
  }
});
