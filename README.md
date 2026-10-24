# Singapore Trip — Google Maps 版本

新加坡家族旅行行程 App。原版使用 **Leaflet + OpenStreetMap** 圖磚，本版改為 **Google Maps JavaScript API**，並針對 **GitHub Pages 部署**做了完整處理。

---

## 📁 檔案結構

```
.
├── index.html            主程式（介面 + 邏輯）
├── config.js             ★ 唯一需要修改的檔案：填入 API Key
├── README.md             本文件
└── DEPLOY_CHECKLIST.md   部署檢查清單（照著打勾就能上線）
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
2. 複製產生出來的金鑰（`AIza...` 開頭）

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
GOOGLE_MAPS_API_KEY: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456",
```

存檔、重新整理網頁即可看到地圖。

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
git add index.html config.js README.md DEPLOY_CHECKLIST.md
git commit -m "Singapore trip app with Google Maps"
git branch -M main
git remote add origin https://github.com/你的帳號/singapore-trip.git
git push -u origin main
```

然後到 Settings → Pages 設定 branch 為 `main` / root。

> 💡 **子目錄不是根目錄時會 404 嗎？**
> 不會，因為本專案所有資源都用相對路徑 `config.js`，而非 `/config.js`。這是 GitHub Pages 專案網站（`帳號.github.io/repo/`）最常見的失敗原因，本版已從根本避開。

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
| 地圖區顯示「尚未設定 API Key」 | `config.js` 仍是佔位符 | 填入真的金鑰 |
| 顯示「請改用 http(s) 開啟本頁」 | 用 `file://` 開啟 | 跑 `python3 -m http.server 8080` |
| **「金鑰被 Google 拒絕 (RefererNotAllowed)」** | referrer 白名單沒包含你的網域 | 到憑證頁加入 `https://*.github.io/*`；剛改完等 5 分鐘 |
| **「Maps JavaScript API 未啟用」** | 沒啟用 API 或沒綁計費 | 到程式庫啟用，並到帳單綁信用卡 |
| 地圖一片灰，但沒有錯誤訊息 | 容器高度為 0（分頁隱藏時初始化） | 本版已處理：只在切到地圖分頁時才初始化，並觸發 `resize` |
| Console 出現 `InvalidKeyMapError` | Key 打錯 / 多了空白 | 重新複製，注意首尾不要有空白 |
| 地圖出現但標記不見 | 極少數情況 SDK 未完全載入 | 按地圖區的「重試」按鈕 |

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

### 方式 1（預設，推薦給個人專案）
直接填在 `config.js`。配合 referrer 白名單，金鑰外流也無法被盜用。

### 方式 2：`.gitignore` + 本機專用檔
若你想讓 repo 保持乾淨：

1. 把 `config.js` 加入 `.gitignore`
2. 建立 `config.example.js` 一起上傳（內容為佔位符）
3. 本機複製一份 `config.js` 填真鑰匙

`.gitignore`：
```
config.js
```
`config.example.js`：
```js
window.APP_CONFIG = { GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE" };
```

> 但這樣 **GitHub Pages 上就沒有 config.js 了**，需要改用方式 3，或把 config.js 另外 push（`git add -f config.js`）。

### 方式 3：GitHub Actions + Repository Secret（最嚴謹）
用 GitHub Actions 在部署時把 Secret 注入 `config.js`：

`.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Inject API key
        run: |
          cat > config.js <<EOF
          window.APP_CONFIG = {
            GOOGLE_MAPS_API_KEY: "${{ secrets.GMAPS_API_KEY }}",
            MAP_ID: "",
            DEFAULT_CENTER: { lat: 1.2913, lng: 103.8577 },
            DEFAULT_ZOOM: 12,
            LOCALE: "zh-TW",
            REGION: "SG",
            LOAD_TIMEOUT_MS: 15000
          };
          EOF
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - uses: actions/deploy-pages@v4
```

設定：repo → **Settings → Secrets and variables → Actions → New repository secret**，名稱 `GMAPS_API_KEY`，值填你的金鑰。

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

---

## 📄 授權與致謝

- 地圖服務：Google Maps Platform
- 行程資料：原檔作者
- 照片：Unsplash
