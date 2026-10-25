# Singapore Trip — Google Maps 版本

新加坡家族旅行行程 App。原版使用 **Leaflet + OpenStreetMap** 圖磚，本版改為 **Google Maps JavaScript API**，並針對 **GitHub Pages 部署**做了完整處理。

支援兩種部署方式：**手動上傳**（最簡單）與 **GitHub Actions 自動部署 + API Key 注入**（推薦，repo 內永遠不會出現金鑰）。

---

## 🩺 本次線上診斷結果（2026-10-24）

針對 <https://wayne66072004-star.github.io/singapore-trip/> 的實際檢測：

| 檢查項目 | 結果 |
|---|---|
| 線上 `config.js` 金鑰 | ✅ 已注入真金鑰（`AIzaSy…`，39 字元） |
| `index.html` 載入 `config.js` | ✅ 相對路徑，HTTP 200，無 404 |
| Google Maps SDK 載入 | ✅ 成功（`maps.googleapis.com` 回 200） |
| **Google Maps 錯誤碼** | ❌ **`ApiNotActivatedMapError`** |
| 圖磚載入 | ❌ 0 張（底圖全白） |
| GitHub Actions | ✅ 部署成功（`pages build and deployment`） |

### 根本原因

**Maps JavaScript API 沒有在 Google Cloud 專案中啟用。**

金鑰本身完全正常（長度、格式、注入流程都對），referrer 白名單也不是問題——
Google 在檢查 referrer 之前就先擋下了「API 未啟用」這個更根本的錯誤。

### 修正做法（約 2 分鐘）

1. 前往 <https://console.cloud.google.com/apis/library/maps-backend.googleapis.com>
2. 確認右上角選中的是**這把金鑰所屬的專案**
3. 按下藍色的 **「啟用」** 按鈕
4. 等 1～5 分鐘，重新整理網頁

> 若按鈕顯示「管理」而非「啟用」，代表已經啟用過了，請改檢查「帳單」是否已綁定計費帳戶。

### 本版新增：自動顯示錯誤碼

過去遇到這個錯誤，使用者只會看到一片空白地圖，必須自己開 DevTools 才找得到原因。
本版攔截 `console.error`，把 Google 回傳的錯誤碼直接顯示在網頁上，並附上對應的修正步驟：

```
Maps JavaScript API 未啟用（ApiNotActivatedMapError）
金鑰本身有效，但這個專案還沒啟用 Maps JavaScript API。請到 Google Cloud
Console →「API 和服務」→「程式庫」，搜尋 Maps JavaScript API 並按下「啟用」。

origin: https://wayne66072004-star.github.io   |   key: AIzaSy…（39 字元）   |   error: ApiNotActivatedMapError
```

診斷列只顯示金鑰前 6 碼與長度，**不會洩漏完整金鑰**。

---

## 📁 檔案結構

```
.
├── index.html                         主程式（介面 + 邏輯）
├── config.js                          ★ 設定檔：API Key 佔位符
├── README.md                          本文件
├── DEPLOY_CHECKLIST.md                部署檢查清單（照著打勾就能上線）
├── .gitignore                         排除 _site/ 等建置產物
└── .github/
    └── workflows/
        └── deploy.yml                 ★ GitHub Actions 自動部署 + 金鑰注入
```

全部使用**相對路徑**載入，可放在 GitHub Pages 的任何子目錄（例如 `https://你的帳號.github.io/singapore-trip/`）。

---

## 🚀 快速開始（本機測試）

```bash
# 在這個資料夾內執行
python3 -m http.server 8080
```

然後開啟 <http://localhost:8080>

> ⚠️ **不要直接雙擊 index.html。** 用 `file://` 開啟時瀏覽器不會送出 `Referer` 標頭，而 Google Maps 的金鑰驗證依賴 referrer，因此一定失敗。程式會偵測到並顯示提示。

若還沒填 Key，地圖區會顯示「尚未設定 API Key」的說明卡，**其餘五個分頁功能全部正常**。

---

## 🔑 申請與設定 Google Maps API Key

### 步驟 1：建立 Google Cloud 專案

1. 前往 <https://console.cloud.google.com/>
2. 右上角專案選單 → **新增專案** → 取名（例如 `singapore-trip`）→ 建立

### 步驟 2：啟用 Maps JavaScript API

1. 左側選單 → **API 和服務** → **程式庫**
2. 搜尋 `Maps JavaScript API` → 點進去 → **啟用**

> 只需要這一個 API。若你之後想用地點搜尋，才需要再加 `Places API`。

### 步驟 3：綁定計費帳戶

1. 左側選單 → **帳單** → **連結帳單帳戶**
2. 綁定信用卡

**費用說明：** Google Maps 提供每月 **USD $200 的免費額度**（幾乎所有個人專案都用不完）。以本頁為例，只有「開啟地圖分頁」時才會載入一次 SDK，一次瀏覽大約消耗 1 次 *Dynamic Maps* 載入。單純自己家人使用，費用為 **0 元**。

> ⚠️ 2025 年起 Google 調整了計價方式，建議在 **帳單 → 預算與快訊** 設一筆 `NT$100` 的預算警示，額度快用完時會 email 通知你。

### 步驟 4：建立 API Key

1. **API 和服務** → **憑證** → **建立憑證** → **API 金鑰**
2. 複製產生出來的鑰匙（`AIza...` 開頭）

### 步驟 5：★ 設定金鑰限制（最重要的一步）

點擊剛建立的金鑰 → 進入設定頁：

#### (A) 應用程式限制 → 選「網站」

在「網站限制」中加入**允許的 HTTP 參照網址**。GitHub Pages 的白名單寫法：

```
https://你的帳號.github.io/*
https://*.github.io/*
```

建議多加一組本機測試用：

```
http://localhost:*/*
http://127.0.0.1:*/*
```

> **為什麼要這樣寫？**
> - `*.github.io/*` 用萬用字元涵蓋所有 GitHub Pages 子網域，`*` 可匹配任意前綴。
> - 結尾的 `/*` 涵蓋路徑，避免只放行首頁而子目錄 404。
> - 若你的帳號是 `wayne6607`，網址是 `https://wayne6607.github.io/trip/`，上面第一條（換成你的帳號）就能放行。

> **注意：** Google 的白名單格式**不支援**在路徑後面接 `*` 當檔名萬用字元以外的寫法，也**不接受** `github.io/你的repo` 這種沒有 `https://` 前綴的字串。一定要完整協定。

#### (B) API 限制 → 選「限制金鑰」

只勾選：

- ✅ **Maps JavaScript API**

其他全部取消。這樣就算金鑰外流，別人也無法用它呼叫 Directions、Places 等高價 API。

#### (C) 儲存

按下 **儲存**，限制會在 **約 1～5 分鐘**後生效（有時需要 10 分鐘）。若剛設定完仍被拒絕，稍等再試。

### 步驟 6：填入 config.js

打開 `config.js`，把第 ① 項換成你的金鑰：

```js
GOOGLE_MAPS_API_KEY: "__GOOGLE_MAPS_API_KEY__",
```

存檔、重新整理網頁即可看到地圖。

> 💡 若你打算用 **GitHub Actions 自動部署**（下一節），這裡**保持 `__GOOGLE_MAPS_API_KEY__` 不要改**，金鑰交給 Secret 管理。

---

## 🌐 部署到 GitHub Pages

### 方法 A：網頁介面上傳（最簡單，適合初學者）

1. 登入 GitHub → 右上角 **+** → **New repository**
2. Repository name 填 `singapore-trip`，選 **Public**（Private repo 的 Pages 需要付費方案）→ **Create repository**
3. 進入 repo → **Add file** → **Upload files**
4. 把 `index.html`、`config.js`、`README.md`、`DEPLOY_CHECKLIST.md` 一起拖進去 → **Commit changes**
5. 上方選單 **Settings** → 左側 **Pages**
6. **Source** 選 `Deploy from a branch`
7. **Branch** 選 `main`，資料夾選 `/ (root)` → **Save**
8. 等 1～2 分鐘，頁面上方會出現網址：

```
https://你的帳號.github.io/singapore-trip/
```

### 方法 B：用 Git 指令

```bash
git init
git add index.html config.js README.md DEPLOY_CHECKLIST.md .gitignore
git add .github/workflows/deploy.yml
git commit -m "Singapore trip app with Google Maps"
git branch -M main
git remote add origin https://github.com/你的帳號/singapore-trip.git
git push -u origin main
```

然後到 Settings → Pages 設定 branch 為 `main` / root。

> 💡 **子目錄不是根目錄時會 404 嗎？**
> 不會，因為本專案所有資源都用相對路徑 `config.js`，而非 `/config.js`。這是 GitHub Pages 專案網站（`帳號.github.io/repo/`）最常見的失敗原因，本版已從根本避開。

---

## 🤖 用 GitHub Actions 部署（自動注入 API Key）

這是**推薦的做法**：repo 裡永遠只有佔位符 `__GOOGLE_MAPS_API_KEY__`，真金鑰存在 GitHub Secret 裡，部署時才由 workflow 注入。

### 運作原理

```
push 到 main
   ↓
① actions/checkout          取得原始碼（config.js 內是佔位符）
   ↓
② actions/configure-pages   設定 Pages 環境
   ↓
③ 複製 index.html / config.js → _site/
   ↓
④ sed 把 _site/config.js 的 __GOOGLE_MAPS_API_KEY__ 換成 Secret
   ↓
⑤ actions/upload-pages-artifact   上傳 _site/
   ↓
⑥ actions/deploy-pages            發佈到 GitHub Pages
```

**結果**：線上版本含真金鑰，repo 內永遠只有佔位符。

### 步驟 1：建立 Repository Secret

1. 進入你的 repo
2. **Settings** → 左側 **Secrets and variables** → **Actions**
3. 點 **New repository secret**
4. **Name** 填：`GOOGLE_MAPS_API_KEY`
   ⚠️ 名稱必須**完全一致**（全大寫、底線分隔），workflow 是靠這個名字讀取的
5. **Secret** 填你的金鑰（`AIza...` 開頭，**不要**加引號、不要有空白或換行）
6. 按 **Add secret**

> Secret 建立後就無法再查看內容，只能重新設定。貼上時請確認沒有複製到多餘的空白。

### 步驟 2：把 Pages 的 Source 改成「GitHub Actions」

1. **Settings** → 左側 **Pages**
2. **Source** 下拉選單 → 選 **`GitHub Actions`**（不是 `Deploy from a branch`）
3. 不需要選 branch，也不用按 Save（選了就生效）

> ⚠️ 這步**一定要改**。若仍停留在 `Deploy from a branch`，workflow 會執行成功但網站不會更新，或 deploy job 直接失敗。

### 步驟 3：推送程式碼

```bash
git add .
git commit -m "Add GitHub Actions deploy workflow"
git push origin main
```

推送後到 repo 的 **Actions** 分頁，會看到 `Deploy to GitHub Pages` 正在執行。整個流程約 30～60 秒。

### 步驟 4：手動觸發（選用）

換了金鑰、或想重新部署但沒有新 commit 時：

1. 進入 repo → **Actions** 分頁
2. 左側點 **Deploy to GitHub Pages**
3. 右側點 **Run workflow** → 選 `main` 分支 → **Run workflow**

（這是因為 workflow 設定了 `workflow_dispatch` 觸發條件。）

### 步驟 5：確認部署結果

1. Actions 分頁 → 點進該次執行 → 兩個 job 都應該是綠色勾勾：
   - `build` — 建置與注入金鑰
   - `deploy` — 發佈到 Pages
2. 點 `deploy` job → 展開 **Deploy to GitHub Pages** 步驟 → 會看到 `page_url`
3. 或直接到 **Settings → Pages** 看頂部的網址

### 步驟 6：更新金鑰時

只需在 **Settings → Secrets and variables → Actions** 點 `GOOGLE_MAPS_API_KEY` → **Update**，然後到 Actions 分頁手動觸發一次即可。**完全不用改程式碼、不用 commit。**

---

## 🛠 GitHub Actions 常見錯誤排查

| 症狀 | 原因 | 解法 |
|---|---|---|
| `缺少 API Key` / `Repository Secret 'GOOGLE_MAPS_API_KEY' 不存在或為空` | Secret 名稱打錯，或根本沒建立 | 到 Settings → Secrets and variables → Actions 確認名稱**逐字**為 `GOOGLE_MAPS_API_KEY`（區分大小寫）。常見錯誤：打成 `GMAPS_API_KEY`、`GOOGLE_MAP_API_KEY`、`google_maps_api_key` |
| `找不到佔位符` / `_site/config.js 中找不到 __GOOGLE_MAPS_API_KEY__` | `config.js` 的佔位符被改掉了 | 把 `GOOGLE_MAPS_API_KEY` 的值改回 `"__GOOGLE_MAPS_API_KEY__"`（前後各兩個底線，不可有空白） |
| `金鑰長度異常` / `注入後的金鑰只有 N 個字元` | Secret 內容是空的，或貼成了佔位符本身 | 重新 Update Secret，貼上真正的 `AIza...` 金鑰，注意不要有前後空白或換行 |
| deploy job 失敗：`Get Pages site failed` / `Not Found` | Pages 的 Source 沒改成 GitHub Actions | Settings → Pages → Source 選 **GitHub Actions** |
| deploy job 失敗：`Resource not accessible by integration` | workflow 權限不足 | 確認 `deploy.yml` 頂部的 `permissions:` 有 `contents: read`、`pages: write`、`id-token: write` 三項。若 repo 是組織帳號，還需在 Settings → Actions → General → Workflow permissions 允許 |
| workflow 完全沒被觸發 | 分支名稱不是 `main` | 確認預設分支名稱；若是 `master`，把 `deploy.yml` 的 `branches: [main]` 改成 `[master]` |
| Actions 顯示成功，但網站沒更新 | 瀏覽器快取，或 Pages Source 設定衝突 | 用無痕視窗開啟；確認 Pages Source 是 GitHub Actions 而非 branch |
| 網站 404 | 第一次部署尚未完成 | 等 1～3 分鐘；到 Actions 分頁確認 deploy job 已完成 |
| 網站載入但地圖空白 | 金鑰注入成功但 referrer 白名單不符 | 見下方「疑難排解」——這是 Google 端問題，不是 Actions 問題 |
| `_site/` 出現在 git status | `.gitignore` 沒生效 | 確認 `.gitignore` 內有 `_site/`；若已誤 commit，執行 `git rm -r --cached _site` |

### 想確認注入後的金鑰是否正確？

在 Actions 的 `build` job 日誌中，**不會**印出金鑰內容（這是刻意的安全設計），只會顯示：

```
API key injected (length 39).
```

`AIza` 開頭的金鑰長度通常是 **39 個字元**。若顯示的長度明顯不同（例如 1 或 24），代表 Secret 內容有問題。

---

## ❓ 為什麼原本的 Leaflet / OpenStreetMap 在 GitHub Pages 上會出問題？

原版用的是：

```js
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});
```

**技術上 Leaflet 本身可以正常運作**，但有幾個實務上的坑：

| 問題 | 說明 |
|---|---|
| **圖磚伺服器使用政策** | OSM 的 `tile.openstreetmap.org` 是**社群捐贈的免費資源**，官方〈Tile Usage Policy〉明確禁止「生產環境 / 高流量」用途，且不提供任何可用性保證。他們的伺服器會對 GitHub Pages 這類共享 IP 做速率限制，容易出現灰白格子。 |
| **被 Referer 阻擋** | 部分圖磚供應商（Carto、Stamen、MapTiler 免費層）會檢查 `Referer`，未在後台登記網域就會回 403。GitHub Pages 的 `*.github.io` 常被服務商列入封鎖名單。 |
| **混合內容 (Mixed Content)** | 如果圖磚網址是 `http://`，部署在 `https://` 的 GitHub Pages 上會被瀏覽器**直接封鎖**（本版原檔已用 `https`，這點沒問題，但這是常見的踩雷點）。 |
| **沒有 SLA** | 圖磚掛掉時你無法處理，只能等社群修好。 |

**改用 Google Maps 的差異：**

| 項目 | Leaflet + OSM | Google Maps JS API |
|---|---|---|
| 圖磚穩定性 | 社群免費資源，無 SLA | Google 商業級 SLA（99.9%） |
| 授權驗證 | 無（所以無從保護） | **Referrer 白名單 + API 限制** |
| 費用 | 免費但受限流量 | $200/月免費額度，個人使用為 0 |
| 樣式客製 | CSS filter 硬改 | 原生 JSON 樣式，可完美配合 Muji 色系 |
| 地名語言 | 跟隨圖磚 | `language: 'zh-TW'` 可指定 |

本版同時做了 **Muji 風格的地圖樣式**（米白底、灰綠公園、淺藍水域），視覺上和原設計一致，不是預設的彩色 Google 地圖。

---

## 🛠 疑難排解

| 症狀 | 原因 | 解法 |
|---|---|---|
| 地圖區顯示「尚未設定 API Key」 | `config.js` 仍是佔位符 | 本機：填入真金鑰。Actions：確認 Secret 已建立且 workflow 執行成功 |
| 顯示「請改用 http(s) 開啟本頁」 | 用 `file://` 開啟 | 跑 `python3 -m http.server 8080` |
| **「Maps JavaScript API 未啟用（ApiNotActivatedMapError）」** | **專案沒啟用 API** | **到「程式庫」搜尋 Maps JavaScript API → 啟用；等 1～5 分鐘** |
| **「金鑰的網站限制不含這個網域（RefererNotAllowedMapError）」** | referrer 白名單沒包含你的網域 | 到憑證頁加入 `https://*.github.io/*`；剛改完等 5 分鐘 |
| **「專案未綁定計費帳戶（BillingNotEnabledMapError）」** | 沒綁計費 | 到「帳單」連結信用卡（每月 USD $200 免費額度） |
| **「金鑰無效（InvalidKeyMapError）」** | Key 打錯 / 多了空白 | 重新複製，注意首尾不要有空白 |
| **「金鑰已過期（ExpiredKeyMapError）」** | 金鑰已失效 | 建立新金鑰並更新 config.js 或 Secret |
| **「金鑰的 API 限制未包含 Maps JavaScript API（ApiTargetBlockedMapError）」** | API 限制勾錯 | 憑證 → API 限制 → 勾選 Maps JavaScript API |
| 地圖一片灰，但沒有錯誤訊息 | 容器高度為 0（分頁隱藏時初始化） | 本版已處理：只在切到地圖分頁時才初始化，並觸發 `resize` |
| 地圖出現但標記不見 | 極少數情況 SDK 未完全載入 | 按地圖區的「重試」按鈕 |

> 💡 **本版會自動辨識上表所有 `XXXMapError` 錯誤碼**，直接顯示對應的修正步驟，
> 不必自己開 DevTools 找。若看到的是「地圖已初始化，但圖磚未載入」，
> 請按 F12 到 Console 尋找 `Google Maps JavaScript API error: XXXMapError` 字樣。

### 想快速驗證金鑰有沒有生效？

在瀏覽器 Console 貼上（換成你的 Key）：

```js
fetch('https://maps.googleapis.com/maps/api/js?key=你的KEY&libraries=marker')
  .then(r => r.text())
  .then(t => console.log(t.slice(0, 300)));
```

- 回傳 `...google.maps...` 正常程式碼 → Key 可用
- 回傳 `RefererNotAllowedMapError` → 白名單問題
- 回傳 `ApiNotActivatedMapError` → API 沒啟用

---

## 🔒 關於「不要把 Key 寫進 repo」

你的需求提到「不要硬編碼在 repo 中」。這裡說明實際做法與其限制：

**Google Maps JS API 的金鑰本質上是公開的。** 它必須被瀏覽器讀取才能載入 SDK，任何「隱藏」手法（base64、混淆、拆字串）都只是延遲被發現的時間，無法真正保密。**Google 官方文件也明確說明這一點**，正確的防護是 referrer 限制 + API 限制，而不是藏金鑰。

本版提供三種管理方式，你可依情境選擇：

### 方式 1：直接填在 config.js（最簡單）
適合個人專案、不在意 repo 出現金鑰字串。配合 referrer 白名單，金鑰外流也無法被盜用。

### 方式 2：`.gitignore` + 本機專用檔
若你想讓 repo 保持乾淨：

1. 把 `config.js` 加入 `.gitignore`（本專案 `.gitignore` 內已預留這行，取消註解即可）
2. 建立 `config.example.js` 一起上傳（內容為佔位符）
3. 本機複製一份 `config.js` 填真金鑰

`.gitignore`：
```
config.js
```
`config.example.js`：
```js
window.APP_CONFIG = { GOOGLE_MAPS_API_KEY: "__GOOGLE_MAPS_API_KEY__" };
```

> 但這樣 **GitHub Pages 上就沒有 config.js 了**，需要改用方式 3，或把 config.js 另外 push（`git add -f config.js`）。

### 方式 3：GitHub Actions + Repository Secret（本版已內建，推薦）

`config.js` 內永遠只有 `__GOOGLE_MAPS_API_KEY__`，真金鑰存在 Repository Secret，部署時由 `.github/workflows/deploy.yml` 用 `sed` 注入到 `_site/config.js`，再上傳為 Pages artifact。

完整設定步驟見上方〈用 GitHub Actions 部署〉章節。

> 老實說：因為金鑰最終一定出現在瀏覽器裡，方式 3 的實際安全增益有限，主要好處是「repo 原始碼不會出現金鑰字串」與「換 Key 不用改程式碼」。**真正的防線永遠是 referrer 白名單。**

---

## ✅ 功能對照（原版 → 本版）

| 功能 | 原版 | 本版 |
|---|---|---|
| 行程時間軸（5 天） | Leaflet 專案內的 itineraryData | ✅ 完整保留，資料未改動 |
| 地圖底圖 | Leaflet + OSM 圖磚 | ✅ **Google Maps JS API + Muji 自訂樣式** |
| 景點標記 | `L.divIcon` 圓點 | ✅ SVG data URI 圓點（無外部圖檔，不會 404） |
| 點列表→地圖亮燈 | `flyTo` + `setIcon` | ✅ `panTo` + 換圖示 + InfoWindow |
| 重置全景 | `fitBounds` | ✅ `fitBounds`（含 padding） |
| 記帳 / 匯率 / 計算機 | localStorage | ✅ 完整保留 |
| 行前清單 | localStorage | ✅ 完整保留 |
| 備忘錄（網址轉連結） | 有 | ✅ 完整保留 |
| 資訊分頁（緊急電話） | `http://` 氣象局連結 | ✅ 改為 `https://`（避免 HTTPS 頁面跳警告） |
| 地圖錯誤提示 | 無 | ✅ **新增 5 種狀態說明卡 + 重試按鈕** |
| 部署方式 | 手動上傳 | ✅ **新增 GitHub Actions 自動部署 + 金鑰注入** |

---

## 📄 授權與致謝

- 地圖服務：Google Maps Platform
- 行程資料：原檔作者
- 照片：Unsplash
