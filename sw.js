/* Helm shell cache. Same-origin static files only. Never the app HTML. */
const CACHE = 'helm-shell-v1'
const SHELL = [
  '/helm/boot.js',
  '/helm/manifest.webmanifest',
  '/helm/icons/icon-180.png',
  '/helm/icons/icon-192.png',
  '/helm/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

function isShellPath(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/helm/')
}

function isDocument(url, request) {
  if (request.mode === 'navigate') return true
  if (url.pathname === '/helm/' || url.pathname === '/helm/index.html') return true
  return false
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (!isShellPath(url)) return
  if (event.request.method !== 'GET') return
  if (isDocument(url, event.request)) return
  if (url.pathname.endsWith('/helm-public.json')) return
  if (url.hostname === 'api.github.com' || url.hostname.endsWith('.trycloudflare.com')) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(event.request)
      if (cached) {
        event.waitUntil(
          fetch(event.request)
            .then((res) => {
              if (res.ok) cache.put(event.request, res.clone())
            })
            .catch(() => {}),
        )
        return cached
      }
      const res = await fetch(event.request)
      if (res.ok) cache.put(event.request, res.clone())
      return res
    })(),
  )
})
