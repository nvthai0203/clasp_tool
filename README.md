# Clasp Tool

Desktop GUI (Electron + React + TypeScript) cho [clasp](https://github.com/google/clasp) — login / clone / pull / push / deploy, log realtime.

Repo: [github.com/nvthai0203/clasp_tool](https://github.com/nvthai0203/clasp_tool)

## Tải về (Windows)

**[⬇ Clasp.Tool.exe (v1.0.0)](https://github.com/nvthai0203/clasp_tool/releases/download/v1.0.0/Clasp.Tool.exe)**

1. Chạy `Clasp.Tool.exe`.
2. Cài clasp (app không nhúng sẵn):

```bash
npm i -g @google/clasp
```

3. `clasp --version` → mở app, kiểm tra badge phiên bản clasp.

> SmartScreen có thể cảnh báo (app chưa ký) — *More info* → *Run anyway* nếu tin nguồn này.

## Yêu cầu

- Node.js 18+
- `npm i -g @google/clasp`

## Cách dùng nhanh

1. **Chọn folder** (bắt buộc trước hầu hết lệnh, kể cả login).
2. Tab **Đồng bộ** → **login** → dán Script ID → **clone** (hoặc **create**).
3. Sửa code → **push** / **pull**. Deploy nằm tab **Deploy**; `run` + Custom nằm tab **Khác**.
4. Panel **Log**: Copy / Clear / **Hủy** (dừng lệnh đang chạy, ví dụ `push --watch`).

**Lưu ý:** lệnh nguy hiểm (`push --force`, `undeploy`, `delete`, custom có `--force`) luôn hỏi xác nhận. Chỉ một lệnh clasp chạy tại một thời điểm.

## Phát triển

```bash
npm install
npm run dev
```

Lỗi Electron (`Electron uninstall` / binary thiếu): chạy `node node_modules/electron/install.js`, hoặc cài lại `electron`. Tránh để project trong OneDrive nếu binary vẫn lỗi.

## Đóng gói & Release

```bash
npm run dist
```

Ra `release/` (Setup `.exe` hoặc `win-unpacked`). Upload GitHub Release với tên asset **`Clasp.Tool.exe`**, tag `vX.Y.Z`, rồi cập nhật link mục **Tải về**.

```bash
gh release create v1.0.0 "release/Clasp.Tool.exe" --title "Clasp Tool v1.0.0" --notes "Windows x64. Sau khi cài: npm i -g @google/clasp"
```

Chỉ build không đóng gói: `npm run build` rồi `npm run preview`.
