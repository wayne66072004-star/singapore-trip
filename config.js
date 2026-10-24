/**
 * ============================================================
 *  config.js  —  Google Maps 設定檔
 * ============================================================
 *
 *  ⚠️ 重要觀念：Google Maps JavaScript API 的 Key 是「前端金鑰」，
 *     只要網頁能跑，瀏覽器就一定看得到它 —— 這不是安全漏洞，
 *     這是 Google Maps JS API 的既定設計。
 *
 *     因此正確的保護方式「不是把 Key 藏起來」，而是：
 *       1. 在 Google Cloud Console 設定「HTTP 參照網址 (referrer) 限制」
 *          → 只有你自己的網域能用這把 Key
 *       2. 在「API 限制」中只勾選 Maps JavaScript API
 *          → 這把 Key 不能用來呼叫其他付費 API
 *       3. 設定配額上限 / 預算警示
 *          → 就算真的外流，損失也有上限
 *
 *     詳細步驟請見 README.md。
 * ------------------------------------------------------------
 *
 *  🔑 關於 __GOOGLE_MAPS_API_KEY__ 佔位符
 * ------------------------------------------------------------
 *  本檔刻意「不」存放真金鑰，只放佔位符。有兩種填入方式：
 *
 *  【方式 A】本機測試：直接把下面第 ① 項換成你的金鑰
 *            （但這樣 commit 時金鑰就會進 repo，僅建議臨時使用）
 *
 *  【方式 B】GitHub Actions 自動注入（推薦）：
 *            保持佔位符不動，把金鑰存到 repo 的
 *            Settings → Secrets and variables → Actions
 *            → New repository secret，名稱 GOOGLE_MAPS_API_KEY
 *            部署時 workflow 會自動把佔位符換成真金鑰，
 *            repo 裡永遠只有 __GOOGLE_MAPS_API_KEY__。
 *            詳見 .github/workflows/deploy.yml 與 README.md。
 *
 *  ⚠️ 若使用方式 B，請勿手動修改佔位符字串 ——
 *     workflow 是靠精確比對 __GOOGLE_MAPS_API_KEY__ 來替換的，
 *     改掉它會導致注入失敗（workflow 會主動報錯提醒你）。
 */

window.APP_CONFIG = {
  /* ---------------------------------------------------------
   * ① 必填：你的 Google Maps API Key
   * ---------------------------------------------------------
   * 保持 __GOOGLE_MAPS_API_KEY__ 不變 → 由 GitHub Actions 注入
   * 改成 "AIza..." 開頭的字串     → 本機直接使用
   *
   * 若維持佔位符，網頁仍可正常開啟，但地圖區會顯示
   * 清楚的設定提示（其他所有功能都不受影響）。
   */
  GOOGLE_MAPS_API_KEY: "__GOOGLE_MAPS_API_KEY__",

  /* ---------------------------------------------------------
   * ② 選填：Map ID（只有想用新版 AdvancedMarkerElement 才需要）
   * ---------------------------------------------------------
   * 留空字串時，程式會自動使用相容性最好的傳統 Marker。
   * 若你在 Google Cloud Console → Maps → Map Management 建了
   * Map ID，填進來即可啟用新版標記。
   */
  MAP_ID: "",

  /* ---------------------------------------------------------
   * ③ 選填：地圖初始視角（新加坡濱海灣）
   * --------------------------------------------------------- */
  DEFAULT_CENTER: { lat: 1.2913, lng: 103.8577 },
  DEFAULT_ZOOM: 12,

  /* ---------------------------------------------------------
   * ④ 選填：語言與地區（影響地圖上的地名顯示語言）
   * --------------------------------------------------------- */
  LOCALE: "zh-TW",
  REGION: "SG",

  /* ---------------------------------------------------------
   * ⑤ 選填：載入 Google Maps SDK 的逾時秒數
   * --------------------------------------------------------- */
  LOAD_TIMEOUT_MS: 15000
};

/* ============================================================
 *  以下為開發便利功能，一般部署不需要修改
 * ============================================================
 * 本機測試時，若不想把 Key 寫進這個檔案（避免誤 commit），
 * 可以用下列兩種方式臨時覆蓋：
 *
 *   A) 在網址後面加參數：  index.html?key=AIza...
 *   B) 在瀏覽器 Console 執行一次：
 *        localStorage.setItem('gmaps_dev_key', 'AIza...')
 *      然後重新整理即可（想清除就 removeItem）。
 *
 * 注意：這兩種覆蓋方式僅建議在本機使用。
 * ============================================================ */
(function applyDevOverride() {
  try {
    var cfg = window.APP_CONFIG;

    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("key");
    if (fromQuery) {
      cfg.GOOGLE_MAPS_API_KEY = fromQuery;
      cfg.__KEY_SOURCE = "url";
      return;
    }

    var fromStorage = window.localStorage.getItem("gmaps_dev_key");
    if (fromStorage) {
      cfg.GOOGLE_MAPS_API_KEY = fromStorage;
      cfg.__KEY_SOURCE = "localStorage";
    }
  } catch (e) {
    /* 隱私模式下 localStorage 可能被封鎖，忽略即可 */
  }
})();
