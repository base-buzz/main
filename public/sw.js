const CACHE_NAME = "basebuzz-cache-v1";

// Assets to precache
const PRECACHE_ASSETS = [
  "/",
  "/home",
  "/explore",
  "/notifications",
  "/messages",
  "/manifest.json",
  "/favicon.ico",
  "/black.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - precache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== CACHE_NAME;
            })
            .map((name) => {
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch event - network first, fallback to cache strategy
self.addEventListener("fetch", (event) => {
  // Skip for non-GET requests and browser extensions
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension") ||
    event.request.url.includes("extension") ||
    !event.request.url.match(/^(http|https):\/\//i)
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // For API requests, always go to network
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // For navigation requests, use network-first strategy
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return response;
          }

          // If network request fails, try the cache
          return caches.match(event.request);
        })
        .catch(() => {
          return caches.match(event.request).then((cacheResponse) => {
            // Fall back to a cached version or offline page
            return cacheResponse || caches.match("/");
          });
        }),
    );
    return;
  }

  // For static assets, use cache-first strategy
  if (
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
    )
  ) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          // Fetch from network if not in cache
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) {
            return new Response(
              '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" font-family="sans-serif" font-size="24" text-anchor="middle">Image Not Available</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } },
            );
          }
          return new Response("Resource not available offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }),
    );
    return;
  }

  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        }
        return caches.match(event.request);
      })
      .catch(() => {
        return caches.match(event.request);
      }),
  );
});
