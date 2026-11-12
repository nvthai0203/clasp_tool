# Clasp Tool

Desktop GUI (Electron + React + TypeScript) cho [clasp](https://github.com/google/clasp) — chọn thư mục, dán Script ID, chạy login / clone / pull / push / deploy và xem log realtime.

## Yêu cầu

- Node.js 18+
- clasp cài global:

```bash
npm i -g @google/clasp
```

## Phát triển

```bash
npm install
npm run dev
```

Nếu gặp lỗi `Electron failed to install correctly` / `Electron uninstall`, tải lại binary:

```bash
node node_modules/electron/install.js
```

hoặc xóa `node_modules/electron` rồi `npm install electron --save-dev`.

## Đóng gói thành app dùng trên laptop / PC (Windows)

App được đóng gói bằng **electron-builder** thành bộ cài NSIS (`.exe`). Sau khi cài, mở như phần mềm bình thường — không cần chạy `npm run dev`.

### Máy dùng để đóng gói (máy build)

1. Cài [Node.js 18+](https://nodejs.org/) (có `npm`).
2. Clone/mở repo, cài dependency:

```bash
npm install
```

3. Đảm bảo binary Electron đã có (nếu lỗi `Electron failed to install correctly`, xem mục **Phát triển** ở trên).
4. Chạy đóng gói:

```bash
npm run dist
```

Lệnh này sẽ:

1. Build source (`electron-vite build`) → thư mục `out/`
2. Đóng gói Windows x64 (NSIS) → thư mục `release/`

### File nhận được

Trong `release/` thường có:

| File | Mục đích |
| --- | --- |
| `Clasp Tool Setup x.x.x.exe` | **Installer** — mang sang máy khác để cài |
| Thư mục `win-unpacked/` | Bản chạy trực tiếp (portable-ish), không cần cài |

Mang file **Setup `.exe`** (hoặc cả thư mục `win-unpacked`) sang laptop/PC cần dùng.

### Cài trên laptop / PC đích

1. Chạy `Clasp Tool Setup x.x.x.exe`.
2. Chọn thư mục cài (NSIS cho phép đổi đường dẫn).
3. Hoàn tất → mở **Clasp Tool** từ Start Menu / shortcut.
4. **Bắt buộc trên máy đích:** cài clasp global (app gọi CLI `clasp` trên máy đó):

```bash
npm i -g @google/clasp
```

Cần có Node.js trên máy đích để cài clasp. Kiểm tra:

```bash
clasp --version
```

5. Mở Clasp Tool — badge góc trên phải hiện phiên bản clasp. Nếu thiếu, cài lại clasp rồi mở lại app.

### Lưu ý khi dùng bản đóng gói

- Clasp Tool **không nhúng** clasp bên trong; mỗi máy dùng app vẫn cần `clasp` trong PATH.
- Lệnh **Mở Cursor** cần CLI `cursor` trên máy đó (Command Palette Cursor → *Shell Command: Install 'cursor' command in PATH*).
- Lệnh **Mở VS Code** cần CLI `code` trên máy đó (Command Palette VS Code → *Shell Command: Install 'code' command in PATH*).
- Windows Defender / SmartScreen có thể cảnh báo lần đầu với app chưa ký code — chọn *More info* → *Run anyway* nếu bạn tự build.
- Hiện cấu hình chỉ build **Windows x64**. Đóng gói trên máy Windows để có installer Windows.

### Chỉ build không đóng gói

Nếu chỉ muốn kiểm tra bản production local (không tạo installer):

```bash
npm run build
npm run preview
```

## Cách dùng

### 1. Chuẩn bị lần đầu

1. Cài clasp global (xem mục **Yêu cầu**).
2. Chạy app: `npm run dev` (dev) hoặc mở **Clasp Tool** đã cài từ installer trong `release/`.
3. Kiểm tra badge góc trên — phải hiện phiên bản clasp. Nếu thiếu, cài lại clasp rồi mở lại app.

### 2. Chọn thư mục & Script ID

| Khu vực | Việc cần làm |
| --- | --- |
| **Thư mục làm việc** | Bấm **Chọn folder** (hoặc chọn từ danh sách gần đây). **Mở Explorer** / **Mở Cursor** / **Mở VS Code** lần lượt mở folder trong File Explorer, Cursor IDE (`cursor` trong PATH), hoặc VS Code (`code` trong PATH). |
| **Script ID** | Dán Script ID, hoặc dán URL dạng `https://script.google.com/.../projects/<id>/...` — app tự lấy ID. |

- Nếu folder đã có `.clasp.json`, app hiện badge **Có .clasp.json** và Script ID hiện tại.
- Nếu chưa có `.clasp.json`, dùng **clone** hoặc **create** trước khi `pull` / `push` / `deploy`.

### 3. Đăng nhập Google

1. (Tùy chọn) Điền tên user vào ô **User (--user)** nếu dùng nhiều tài khoản clasp.
2. Bấm **login** — trình duyệt mở để xác thực Google.
   1. Xem tiến trình ở panel **Log**. Xong có thể bấm **logout** khi cần.

### 4. Quy trình thường gặp

**Lấy project có sẵn về máy**

1. Chọn folder trống (hoặc folder bạn muốn chứa code).
2. Dán Script ID.
3. Bấm **clone** (có thể điền Version nếu cần bản cụ thể).
4. Sau khi clone thành công, folder sẽ có `.clasp.json` và mã nguồn.

**Đồng bộ code**

- **pull** — tải code từ Google về máy.
- **push** — đẩy code local lên Google.
- Bật **--force** nếu cần ghi đè (có hộp thoại xác nhận).
- Bật **--watch** để tự push mỗi khi sửa file; bấm **Hủy** trên Log để dừng.

**Tạo project mới**

1. Chọn folder.
2. Nhập tiêu đề + loại script (standalone, sheets, …).
3. Bấm **create**.

**Deploy**

1. (Khuyến nghị) **version** — tạo version kèm mô tả.
2. **deploy** — có thể thêm mô tả deploy và/hoặc `deploymentId` để cập nhật deployment cũ.
3. **open-web-app** — mở web app đã deploy (có thể kèm `deploymentId`).
4. **undeploy** — xóa deployment (cần `deploymentId`, có xác nhận).

**Chạy function**

1. Nhập tên function Apps Script.
2. Bấm **run**.

### 5. Panel Log

- Hiện stdout/stderr realtime của lệnh clasp.
- **Copy** — copy toàn bộ log.
- **Clear** — xóa log (khi không có lệnh đang chạy).
- **Hủy** — dừng process đang chạy (hữu ích với `push --watch`).

### 6. Lệnh tùy chỉnh (Custom)

1. Bấm **Hiện** trong mục Custom.
2. Nhập args sau `clasp`, ví dụ: `versions` hoặc `push --watch`.
3. Bấm **Chạy custom**.

### 7. Lệnh nguy hiểm

Các lệnh sau luôn hỏi xác nhận trước khi chạy:

- `push --force`
- `undeploy`
- `delete` (xóa project trên Google)
- Custom args chứa `delete`, `undeploy`, hoặc `--force`

### Gợi ý nhanh

1. **login** → chọn folder → **clone** (Script ID) → sửa code → **push**.
2. Folder đã có project: chọn folder → **pull** / **push** / **deploy**.
3. Chỉ một lệnh clasp chạy tại một thời điểm; muốn đổi lệnh thì **Hủy** trước.
