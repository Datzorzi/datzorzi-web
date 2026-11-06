// GERADO por scripts/gerar-sw.mjs — não edite à mão.
// Versão 1.6.1

const VERSAO  = '1.6.1'
const CACHE   = 'datzorzi-v' + VERSAO
const ARQUIVOS = [
  "assets/browser-Bcb8czj3.js",
  "assets/chunk-DECur_0Z.js",
  "assets/definitions-BFMBZBFx.js",
  "assets/definitions-D-_zv_54.js",
  "assets/dist-C5myb4wS.js",
  "assets/esm-CtfkHpbu.js",
  "assets/esm-Di06hy9a.js",
  "assets/html2canvas-B7wOas6l.js",
  "assets/index-D324Iipb.js",
  "assets/index-DN4oMgdr.css",
  "assets/index.es-DZaW6-sD.js",
  "assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2",
  "assets/inter-cyrillic-wght-normal-DqGufNeO.woff2",
  "assets/inter-greek-ext-wght-normal-DlzME5K_.woff2",
  "assets/inter-greek-wght-normal-CkhJZR-_.woff2",
  "assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2",
  "assets/jetbrains-mono-cyrillic-wght-normal-D73BlboJ.woff2",
  "assets/jetbrains-mono-greek-wght-normal-Bw9x6K1M.woff2",
  "assets/jetbrains-mono-latin-ext-wght-normal-DBQx-q_a.woff2",
  "assets/jetbrains-mono-latin-wght-normal-B9CIFXIH.woff2",
  "assets/jetbrains-mono-vietnamese-wght-normal-Bt-aOZkq.woff2",
  "assets/jspdf.es.min-CnYMXQxH.js",
  "assets/lib-BuoIBeMx.js",
  "assets/preload-helper-2ej06EnG.js",
  "assets/purify.es-DGQ2pGan.js",
  "assets/typeof-DAFjmyY2.js",
  "assets/web-DaDZm62l.js",
  "assets/web-DHx6zq3g.js",
  "assets/web-DrqGmTwt.js",
  "favicon.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons.svg",
  "index.html",
  "manifest.webmanifest"
]

// Guarda tudo que o app precisa para abrir.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll falha inteiro se UM arquivo falhar; um a um, o que der certo fica.
      Promise.all(ARQUIVOS.map((f) => c.add(f).catch(() => {})))
    )
  )
  // Sem skipWaiting de propósito: trocar o service worker por baixo de uma aba
  // aberta faria os pedaços de JavaScript da versão antiga sumirem do cache no
  // meio do uso. A versão nova assume quando o app for fechado e reaberto.
})

// Apaga os caches das versões anteriores.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((n) => n.startsWith('datzorzi-v') && n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  // Só cuida do próprio app. Supabase, OpenAI e afins passam direto: dado velho
  // em cache seria pior que erro de rede — o usuário confiaria num número
  // desatualizado sem saber.
  if (url.origin !== self.location.origin) return

  // O HTML vem da rede primeiro, para quem está online já pegar a versão nova
  // mesmo com o service worker antigo no ar. Sem rede, cai no cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
          return r
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    )
    return
  }

  // Arquivos com hash no nome nunca mudam de conteúdo: cache primeiro.
  e.respondWith(
    caches.match(req).then((cacheado) => {
      if (cacheado) return cacheado
      return fetch(req).then((r) => {
        if (r.ok) {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
        }
        return r
      })
    })
  )
})
