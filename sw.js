/* ============================================================
 *  sw.js — Service Worker（Singapore Trip PWA）
 * ============================================================
 *
 *  功能：
 *    1. 快取 App Shell（HTML / config.js / manifest / 圖示）
 *    2. 離線開啟 —— 沒有網路也能查看行程、記帳、清單、備忘錄
 *    3. 版本更新處理 —— 新版就緒時通知頁面，由使用者按下「重新載入」才切換
 *
 *  ⚠️ 路徑全部使用「相對路徑」。
 *     GitHub Pages 部署在子目錄（/singapore-trip/），
 *     Service Worker 內的相對路徑會以「本檔所在位置」為基準解析，
 *     因此 './index.html' → /singapore-trip/index.html，子目錄下也能正常運作。
 *     切勿改成 '/index.html'（開頭斜線會指向網域根目錄而 404）。
 * ============================================================ */

/* 改版時只要把 VERSION 往上加，舊快取會在 activate 階段自動清除 */
const VERSION = 'v1.0.0';
const SHELL_CACHE = `singapore-trip-shell-${VERSION}`;
const RUNTIME_CACHE = `singapore-trip-runtime-${VERSION}`;

/* App Shell：核心檔案，安裝時預先快取 */
const APP_SHELL = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  './icons/favicon.ico'
];

/* 外部 CDN：樣式與字型，快取後離線仍有正常外觀 */
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* 地圖相關：不做快取（離線時地圖本來就無法運作，頁面已有提示層） */
const NETWORK_ONLY_HOSTS = [
  'maps.googleapis.com',
  'maps.gstatic.com',
  'khms0.googleapis.com',
  'khms1.googleapis.com'
];

/* ------------------------------------------------------------
 *  install：預先快取 App Shell
 * ------------------------------------------------------------
 *  逐檔快取並各自 try/catch —— 單一檔案失敗不會讓整個安裝失敗。
 *  刻意「不」呼叫 skipWaiting()：等使用者在頁面上按下「重新載入」再切換，
 *  避免使用者正在看行程時被強制中斷。
 * ---------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const results = await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
            return { url, ok: true };
          } catch (err) {
            console.warn('[SW] 預快取失敗（略過）:', url, err);
            return { url, ok: false };
          }
        })
      );
      const failed = results.filter((r) => !r.ok).map((r) => r.url);
      console.log(
        `[SW] ${VERSION} 安裝完成，App Shell ${results.length - failed.length}/${results.length} 已快取`,
        failed.length ? { failed } : ''
      );
    })()
  );
});

/* ------------------------------------------------------------
 *  activate：清除舊版本快取，並立即接管頁面
 * ---------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => {
            console.log('[SW] 清除舊快取:', k);
            return caches.delete(k);
          })
      );

      /* 讓同源頁面在下次導覽時直接走新版 SW，不必等重新整理兩次 */
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.disable();
        } catch (e) {
          /* 不支援就忽略 */
        }
      }

      await self.clients.claim();
      console.log(`[SW] ${VERSION} 已啟用`);
    })()
  );
});

/* ------------------------------------------------------------
 *  message：頁面要求切換到新版
 * ---------------------------------------------------------- */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    console.log('[SW] 收到 SKIP_WAITING，切換到新版');
    self.skipWaiting();
  }
  if (data.type === 'GET_VERSION' && event.source) {
    event.source.postMessage({ type: 'VERSION', version: VERSION });
  }
});

/* ------------------------------------------------------------
 *  fetch：分流快取策略
 * ---------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* 只處理 GET；POST 等直接放行 */
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  /* 只處理 http(s)，略過 chrome-extension:// 等 */
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* 1) 導覽請求（開啟網頁）→ 網路優先，離線時回快取的 index.html */
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  /* 2) 地圖相關 → 只走網路 */
  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) {
    return;
  }

  /* 3) 同源靜態資源（config.js / manifest / 圖示）→ 快取優先 + 背景更新 */
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  /* 4) 外部 CDN（Tailwind / Font Awesome / Google Fonts）→ 快取優先 + 背景更新 */
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  /* 5) 其他跨域請求 → 網路優先，失敗則回快取（若有） */
  event.respondWith(networkFirst(req, RUNTIME_CACHE));
});

/* ------------------------------------------------------------
 *  策略實作
 * ---------------------------------------------------------- */

/* 導覽：網路優先 → 快取 index.html → 最後回離線提示頁 */
async function networkFirstNavigation(req) {
  try {
    const fresh = await fetch(req);
    /* 成功就順手更新快取，讓下次離線是最新版本 */
    if (fresh && fresh.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put('./index.html', fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cache = await caches.open(SHELL_CACHE);
    const cached =
      (await cache.match(req, { ignoreSearch: true })) ||
      (await cache.match('./index.html')) ||
      (await cache.match('./'));
    if (cached) {
      console.log('[SW] 離線中，回傳快取的 index.html');
      return cached;
    }
    return offlineFallback();
  }
}

/* 快取優先，同時在背景抓新版更新快取（stale-while-revalidate） */
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreSearch: false });

  const networkPromise = fetch(req)
    .then((res) => {
      /* 只快取成功且可快取的回應（opaque 的 CDN 回應也保留，離線才有樣式） */
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    /* 有快取就先回，背景更新不阻塞畫面 */
    networkPromise.catch(() => {});
    return cached;
  }

  const fresh = await networkPromise;
  if (fresh) return fresh;
  return new Response('', { status: 504, statusText: 'Offline' });
}

/* 網路優先，失敗回快取 */
async function networkFirst(req, cacheName) {
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

/* 完全沒有快取時的離線提示頁（維持 Muji 米白 × 棕視覺） */
function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>離線中 | Singapore Trip</title>
<style>
  html,body{height:100%;margin:0}
  body{background:#F5F5F0;color:#333333;display:flex;align-items:center;justify-content:center;
       font-family:"Noto Sans TC",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px}
  .card{background:#FFFFFF;border:1px solid #E6E6E0;border-radius:14px;padding:28px 24px;max-width:340px;
        text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.04)}
  .dot{width:44px;height:44px;border-radius:50%;background:#F5F5F0;border:1px solid #E6E6E0;
       display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:20px}
  h1{font-size:17px;margin:0 0 8px;font-weight:700;letter-spacing:.02em}
  p{font-size:13px;line-height:1.7;color:#5C5C5C;margin:0 0 20px}
  button{background:#8D7B68;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-size:13px;
         cursor:pointer;font-family:inherit}
  button:active{opacity:.85}
</style>
</head>
<body>
  <div class="card">
    <div class="dot">✈️</div>
    <h1>目前處於離線狀態</h1>
    <p>這個頁面還沒有被快取起來。<br>請連上網路後重新開啟，之後就能離線查看行程。</p>
    <button onclick="location.reload()">重新載入</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
