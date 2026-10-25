# Singapore Trip — PWA 版（可安裝到手機）

新加坡家族旅行行程網頁，已改造成 **PWA（漸進式網頁應用程式）**：
可以「加到主畫面」，像 App 一樣全螢幕開啟，並且**離線也能查看行程**。

- 線上網址：`https://wayne66072004-star.github.io/singapore-trip/`
- 本版**沒有後端資料庫**，所有資料都存在你自己的裝置（localStorage）。

---

## 一、這次做了什麼

### 1. 移除多人協作版的所有東西

| 項目 | 處理 |
|---|---|
| `realtime.js` | 刪除 |
| `collab.js` | 刪除 |
| `config.js` | 還原成原本的 Google Maps 設定檔（無任何資料庫設定） |
| 同步狀態列 | 移除 |
| 編輯模式 / 編輯彈窗 | 移除 |
| 新增 / 修改 / 刪除按鈕 | 移除 |

### 2. 保留原本的所有功能

Muji 米白 × 棕視覺、5 天行程（Day 1～5）、Google 地圖、深度導覽、
航班面板、記帳、清單、備忘錄、字體縮放 —— 全部保留。

**記帳 / 清單 / 備忘錄** 回到用 `localStorage` 存在使用者自己的裝置：

| 資料 | localStorage 鍵名 |
|---|---|
| 記帳 | `muji_sg_expenses` |
| 清單 | `muji_sg_checklist` |
| 備忘錄 | `muji_sg_notes` |
| 字體縮放 | `muji_sg_font_scale` |
| 圖層開關 | `muji_sg_map_layers` |

### 3. 新增 PWA 支援

| 檔案 | 說明 |
|---|---|
| `manifest.json` | App 名稱、`display: standalone`、`theme_color`、`background_color`、4 個圖示（含 maskable） |
| `sw.js` | Service Worker：App Shell 快取、離線開啟、版本更新處理 |
| `icons/icon-192.png` | 192×192 一般圖示 |
| `icons/icon-512.png` | 512×512 一般圖示 |
| `icons/icon-maskable-192.png` | 192×192 maskable（Android 圓形／方形遮罩用） |
| `icons/icon-maskable-512.png` | 512×512 maskable |
| `icons/apple-touch-icon.png` | 180×180 iOS 主畫面圖示 |
| `icons/favicon.ico` | 瀏覽器分頁圖示（16/32/48/64） |
| `icons/favicon-32.png`、`icons/favicon-16.png` | 瀏覽器分頁圖示 |

`index.html` 內新增：

- `<link rel="manifest">`、`<meta name="theme-color">`
- iOS 安裝用 meta：`apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style`、`apple-mobile-web-app-title`、`apple-touch-icon`
- 標題列右側「**安裝**」按鈕
- 底部「安裝到手機主畫面」提示橫幅（可關閉，關閉後不再顯示）
- iOS Safari 的「點分享 → 加入主畫面」**圖文說明面板**
- 離線狀態提示、新版本更新提示（按「重新載入」才切換）
- Service Worker 註冊與更新偵測邏輯

---

## 二、如何在手機上安裝

### Android（Chrome / Edge）

1. 用 Chrome 開啟網址
2. 畫面底部會出現「**安裝到手機主畫面**」橫幅 → 按「安裝」
   （或點右上角 ⋮ 選單 →「安裝應用程式」／「加到主畫面」）
3. 主畫面就會出現「新加坡行程」圖示

### iPhone / iPad（Safari）

> ⚠️ iOS 只能用 **Safari** 加入主畫面，Chrome 不行。

1. 用 **Safari** 開啟網址
2. 點下方工具列中間的「**分享**」圖示 ⬆️
3. 在選單中往下滑，選「**加入主畫面**」
4. 按右上角「**新增**」

網頁上也有同樣的圖文說明：點標題列右側的「安裝」按鈕即可看到。

### 安裝後的好處

- 全螢幕開啟，沒有瀏覽器網址列，像原生 App
- **離線也能看行程**（已快取 App Shell）
- 記帳、清單、備忘錄存在裝置本機，關掉再開還在

---

## 三、部署到 GitHub Pages

### 要上傳的檔案

全部放在 repo 的**根目錄**（與原本的 `index.html` 同一層）：

```
index.html
config.js
manifest.json
sw.js
icons/
  ├── icon-192.png
  ├── icon-512.png
  ├── icon-maskable-192.png
  ├── icon-maskable-512.png
  ├── apple-touch-icon.png
  ├── favicon.ico
  ├── favicon-32.png
  └── favicon-16.png
```

### 步驟

1. 把上述檔案 commit 並 push 到 **`main` 分支**（原本的部署分支）
2. 原本的 `.github/workflows/deploy.yml` **不需要修改** —— 它會把整個 repo 根目錄部署出去，`manifest.json`、`sw.js`、`icons/` 都會一併上線
3. 到 repo 的 **Settings → Pages**，確認 Source 是「GitHub Actions」（或指定 `main` 分支的 `/ (root)`）
4. 等 1～2 分鐘部署完成，開啟 `https://wayne66072004-star.github.io/singapore-trip/`

### ⚠️ 重要提醒

- **PWA 必須在 HTTPS 下才能安裝**。GitHub Pages 預設就是 HTTPS，符合要求。
- **路徑全部使用相對路徑**（`manifest.json`、`sw.js`、`icons/...`，不是 `/manifest.json`）。
  因為網站位於子目錄 `/singapore-trip/`，開頭加斜線會指向網域根目錄而 404。
- **Service Worker 的 scope 是 `./`**，同樣是為了子目錄部署。
- 更新網站後，使用者會看到「有新版本可用」提示，按「重新載入」才會切換到新版
  （避免使用者正在看行程時被強制中斷）。
- 若改了 `sw.js` 的快取內容，記得把 `sw.js` 裡的 `VERSION` 往上加（例如 `v1.0.1`），
  舊快取會在啟用時自動清除。

---

## 四、驗證結果

| 檢查項目 | 結果 |
|---|---|
| 協作版痕跡（realtime / collab / firebase / supabase） | ✅ 全部為 0 |
| HTML 標籤平衡 | ✅ 通過 |
| 內嵌 JS 語法（4 個 script 區塊，`node --check`） | ✅ 全部通過 |
| `sw.js`、`config.js` 語法 | ✅ 通過 |
| `manifest.json` 格式與必填欄位 | ✅ 通過（standalone、192/512、maskable、相對路徑） |
| 圖示檔案尺寸 | ✅ 192×192、512×512、maskable 192/512、180×180 全部正確 |
| 所有檔案 CDN 可取得 | ✅ HTTP 200 |
| Service Worker 註冊 | ✅ 已註冊，scope 正確，狀態 `activated` |
| App Shell 快取 | ✅ 11 個檔案全部快取成功，離線探測全部回 200 |
| 視覺檢查（首頁版面） | ✅ Muji 視覺、標題列、Day 1–5、底部 6 個導覽項目全部正常 |
| 視覺檢查（iOS 安裝說明） | ✅ 3 步驟圖文說明、繁中文字清晰、按鈕正常 |

---

## 五、常見問題

**Q：為什麼地圖顯示「地圖尚未啟用」？**
A：這是原本就存在的問題，與 PWA 無關。Google Cloud 專案的 Maps JavaScript API 未啟用。
到 https://console.cloud.google.com/apis/library/maps-backend.googleapis.com 按「啟用」即可。

**Q：離線時地圖能用嗎？**
A：不行。地圖需要連網，離線時會顯示原本的提示層。但**行程、記帳、清單、備忘錄都能正常查看與編輯**。

**Q：記帳資料會跟家人同步嗎？**
A：不會。本版沒有後端資料庫，資料只存在你自己的裝置。若需要多人共用，需另外接後端服務。

**Q：安裝按鈕沒出現？**
A：可能原因：(1) 已經安裝過了；(2) 之前按過關閉（清除網站資料可恢復）；
(3) 瀏覽器不支援（iOS 請改用 Safari，並點「安裝」按鈕看圖文說明）。
