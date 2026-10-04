const CACHE_NAME = "lifepass-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png"
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// Fetch requests
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never cache Supabase/API requests
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/functions/") ||
    url.pathname.includes("/rest/")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Save successful same-origin responses
        if (
          response &&
          response.status === 200 &&
          url.origin === self.location.origin
        ) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Use cached version when offline
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If navigation fails, return cached homepage
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }

          return new Response("LIFEPASS is currently offline.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain"
            }
          });
        });
      })
  );
});
