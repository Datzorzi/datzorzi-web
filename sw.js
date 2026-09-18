// GERADO por scripts/gerar-sw.mjs — não edite à mão.
// Versão 1.5.6

const VERSAO  = '1.5.6'
const CACHE   = 'datzorzi-v' + VERSAO
const ARQUIVOS = [
  "assets/chunk-DECur_0Z.js",
  "assets/definitions-BZ-kxkUV.js",
  "assets/definitions-R0B7eI3W.js",
  "assets/dist-CfGT9QfJ.js",
  "assets/esm-BYRm6evp.js",
  "assets/esm-CF5TqraZ.js",
  "assets/html2canvas-Dg1yeVo-.js",
  "assets/index-B7DuWR9m.css",
  "assets/index-CGoM7EHs.js",
  "assets/index.es-CFpAkKvY.js",
  "assets/jspdf.es.min-C7LBtq9h.js",
  "assets/preload-helper-2ej06EnG.js",
  "assets/purify.es-CDpUdbr_.js",
  "assets/typeof-DbwFlFFo.js",
  "assets/web-BbqTGcnM.js",
  "assets/web-Cb5lQsTa.js",
  "assets/web-Cbrm_STR.js",
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
