# ✅ 部署檢查清單 — Google Maps 底圖正常顯示

照著順序打勾，從上到下做完就不會遇到「底圖一片空白」。

---

## 階段 A：Google Cloud Console 設定（一次性，約 10 分鐘）

- [ ] **A1** 已建立 Google Cloud 專案（<https://console.cloud.google.com/>）
- [ ] **A2** 已到「API 和服務 → 程式庫」搜尋並**啟用 `Maps JavaScript API`**
- [ ] **A3** 已到「帳單」**綁定計費帳戶**（沒綁的話 API 一律回錯誤）
- [ ] **A4** 已到「帳單 → 預算與快訊」設定 **NT$100 預算警示**（防爆量）
- [ ] **A5** 已到「API 和服務 → 憑證」建立 **API 金鑰**，複製 `AIza...` 開頭的字串
- [ ] **A6** 點進該金鑰 → **應用程式限制** 選「**網站**」，加入至少這三行：
  ```
  https://你的帳號.github.io/*
  https://*.github.io/*
  http://localhost:*/*
  ```
       > `*` 是必需的。只寫 `https://你的帳號.github.io` 沒有結尾 `/*` 會擋掉所有子路徑。
- [ ] **A7** 同一頁 → **API 限制** 選「**限制金鑰**」，只勾 **Maps JavaScript API**，其餘全取消
- [ ] **A8** 按下 **儲存**，並**等待 5 分鐘**讓限制生效（這步最常被跳過，剛存完測試失敗是正常的）

---

## 階段 B：本機檔案設定

- [ ] **B1** 打開 `config.js`
- [ ] **B2** 將 `GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE"` 換成你的金鑰
      ⚠️ 只換引號內的內容，**不要加空格、不要斷行**
- [ ] **B3** 存檔
- [ ] **B4** 確認 `index.html` 載入設定檔用的是**相對路徑**：
  ```html
  <script src="config.js"></script>     ✅ 正確
  <script src="/config.js"></script>    ❌ 錯誤（GitHub Pages 子目錄會 404）
  <script src="./config.js"></script>   ✅ 也可以
  ```

---

## 階段 C：本機驗證（上傳前一定要做）

- [ ] **C1** 在專案資料夾執行 `python3 -m http.server 8080`
- [ ] **C2** 瀏覽器開 <http://localhost:8080>（**不是** 雙擊 index.html）
- [ ] **C3** 頁面正常載入，標題顯示 `Singapore`，六個分頁都在
- [ ] **C4** 點底部「**地圖**」分頁 → 地圖在 1～3 秒內出現
- [ ] **C5** 地圖是**米白色 Muji 風格**（不是預設彩色 Google 地圖）
- [ ] **C6** 地圖上有 **21 個棕色圓點標記**
- [ ] **C7** 點下方任一個景點 → 地圖移動、標記變紅、彈出白色資訊卡
- [ ] **C8** 按「**重置全景**」→ 所有標記回到棕色，視角縮放回全新加坡
- [ ] **C9** 按 F12 開 Console → **沒有任何紅色錯誤**
- [ ] **C10** 切到「行程」分頁 → Day 1～Day 5 切換正常、時間軸顯示
- [ ] **C11** 切到「記帳」分頁 → 匯率載入、可新增一筆支出並看到總計
- [ ] **C12** 切到「清單」分頁 → 打勾、新增、刪除都正常
- [ ] **C13** 重新整理網頁 → 剛才的支出與清單**還在**（localStorage 生效）

> **C4 失敗時**：看地圖區顯示的是哪一種說明卡，直接對照下方〈錯誤訊息對照表〉。

---

## 階段 D：部署到 GitHub Pages

- [ ] **D1** 已建立 GitHub repository（建議 **Public**）
- [ ] **D2** 已上傳 **4 個檔案到 repo 根目錄**：
  `index.html`、`config.js`、`README.md`、`DEPLOY_CHECKLIST.md`
- [ ] **D3** ⚠️ 確認 `config.js` **和 `index.html` 在同一層**（不是放在子資料夾）
- [ ] **D4** Settings → **Pages** → Source 選 `Deploy from a branch`
- [ ] **D5** Branch 選 `main`，資料夾選 `/ (root)` → **Save**
- [ ] **D6** 等 **1～3 分鐘**（第一次部署最慢，可到 Actions 分頁看進度）
- [ ] **D7** 開啟 Pages 頁面上方顯示的網址，格式應為：
  ```
  https://你的帳號.github.io/repo名稱/
  ```

---

## 階段 E：線上驗證（關鍵！很多人漏掉這步）

- [ ] **E1** 確認網址是 **`https://`** 開頭（不是 http）
- [ ] **E2** 網址**結尾有斜線** `/`（沒有斜線有時會 404）
- [ ] **E3** 頁面正常載入，樣式（字體、顏色）正確
- [ ] **E4** 點「地圖」分頁 → **地圖正常顯示**
- [ ] **E5** 按 F12 → Console 無 `RefererNotAllowedMapError`
- [ ] **E6** 用**手機**開啟同一網址，地圖也正常（行動網路，非公司 Wi-Fi）
- [ ] **E7** 從**無痕視窗**開啟，地圖仍正常（排除快取干擾）

---

## 🔍 錯誤訊息對照表

| 你看到的訊息 / 症狀 | 原因 | 對應修正 |
|---|---|---|
| 「**尚未設定 Google Maps API Key**」 | `config.js` 還是佔位符 | **B2** |
| 「**請改用 http(s) 開啟本頁**」 | 用 `file://` 雙擊開啟 | **C1、C2** |
| 「**金鑰被 Google 拒絕 (RefererNotAllowed)**」 | 白名單沒你的網域 | **A6**，改完**等 5 分鐘** |
| Console: `RefererNotAllowedMapError` | 同上 | **A6** |
| 「**Maps JavaScript API 未啟用**」 | API 沒開或沒綁計費 | **A2、A3** |
| Console: `ApiNotActivatedMapError` | 同上 | **A2** |
| Console: `InvalidKeyMapError` | Key 打錯 / 有空白 | **B2** |
| Console: `BillingNotEnabledMapError` | 沒綁計費 | **A3** |
| 地圖一片灰、無錯誤訊息 | 容器高度 0 / 分頁隱藏時初始化 | 本版已處理；按「重試」 |
| 整個頁面沒樣式（純文字） | CDN 被阻擋（公司網路 / 廣告阻擋器） | 換網路或關閉阻擋器 |
| 網頁 404 | Pages 還沒部署完 / 網址錯 | **D6**，等待後重試 |
| 只有首頁 404、其他正常 | 上傳時多包了一層資料夾 | 檔案要放在 repo **根目錄** |
| 地圖出現但標記全消失 | SDK 部分載入失敗 | 按地圖區「**重試**」 |

---

## 🎯 最終確認（三句話總結）

1. **Cloud Console**：Maps JavaScript API 已啟用 ✅ + 已綁計費 ✅ + 金鑰白名單有 `https://*.github.io/*` ✅
2. **檔案**：`config.js` 填了真金鑰 ✅ + 用相對路徑載入 ✅ + 與 index.html 同層 ✅
3. **開啟方式**：本機用 `http://localhost` ✅ + 線上用 `https://` ✅（都不使用 `file://`）

三項全綠，底圖一定正常。

---

## 📌 常見誤解釐清

**Q：把 API Key 放在 config.js 上傳到 GitHub，不會被盜用嗎？**

A：會被看到，但**無法被盜用**。Google Maps JS API 的金鑰必須被瀏覽器讀取，Google 官方文件明說它「不是機密」。真正的保護是 **referrer 白名單**——別人的網站用了你的 Key，Google 會因為 referrer 不符而拒絕，對方看到的就是跟你一樣的「金鑰被拒絕」錯誤。

**Q：`*.github.io/*` 這條會不會太大？別人的 github.io 也能用？**

A：會，但風險極低。此舉是為了讓你換 repo 名稱時不必重設。想更嚴格就只留 `https://你的帳號.github.io/*`，並在換 repo 時回來更新。無論哪種，配上 **API 限制只勾 Maps JavaScript API** + **預算警示**，最壞情況的損失上限也被鎖住。

**Q：一定要用方式 3（GitHub Actions）嗎？**

A：不用。個人／家庭用途用預設的方式 1 就夠了。方式 3 的價值在「原始碼不出現金鑰字串」與「換 Key 不改程式」，不是更高的安全性。
