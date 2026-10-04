const CACHE_NAME = "lifepass-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      ),
      self.registration.navigationPreload
        ? self.registration.navigationPreload.enable()
        : Promise.resolve()
    ])
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/functions/") ||
    url.pathname.includes("/rest/")
  ) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;
          const network = await fetch(request);
          if (network.ok && url.origin === self.location.origin) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          return (await caches.match(request)) ||
            (await caches.match("./index.html")) ||
            new Response("LIFEPASS is currently offline.", {
              status:503,
              headers:{"Content-Type":"text/plain"}
            });
        }
      })()
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) =>
        cached || new Response("LIFEPASS is currently offline.", {
          status:503,
          headers:{"Content-Type":"text/plain"}
        })
      ))
  );
});
