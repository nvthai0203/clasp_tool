# Clasp Tool

Desktop GUI (Electron + React + TypeScript) cho [clasp](https://github.com/google/clasp) — chọn thư mục, dán Script ID, chạy login / clone / pull / push / deploy và xem log realtime.

Giao diện chính: **thanh context** (folder + Script ID) phía trên, panel lệnh bên trái (tab **Đồng bộ** / **Deploy** / **Khác**), panel **Log** bên phải.

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

Nếu gặp lỗi `Electron failed to install correctly` / `Electron uninstall`, thử lần lượt:

```bash
node node_modules/electron/install.js
```

hoặc xóa `node_modules/electron` rồi `npm install electron --save-dev`.

Trên Windows, nếu project nằm trong **OneDrive** và binary vẫn thiếu (`path.txt` / `electron.exe` không có), giải nén từ cache rồi copy thủ công:

```powershell
$zip = Get-ChildItem "$env:LOCALAPPDATA\electron\Cache\*\electron-v*-win32-x64.zip" | Select-Object -First 1
$tmp = "$env:TEMP\electron-fix"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $zip.FullName $tmp -Force
New-Item -ItemType Directory -Force -Path node_modules\electron\dist | Out-Null
Copy-Item "$tmp\*" node_modules\electron\dist\ -Recurse -Force
Set-Content node_modules\electron\path.txt "electron.exe" -NoNewline
```

(Khuyến nghị clone/copy project ra ngoài OneDrive, ví dụ `C:\dev\clasp_tool`, rồi `npm install` lại.)

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

5. Mở Clasp Tool — badge clasp trên thanh context phải hiện phiên bản. Nếu thiếu, cài lại clasp rồi mở lại app.

### Lưu ý khi dùng bản đóng gói

- Clasp Tool **không nhúng** clasp bên trong; mỗi máy dùng app vẫn cần `clasp` trong PATH.
- Lệnh **Mở với Cursor** cần CLI `cursor` trên máy đó (Command Palette Cursor → *Shell Command: Install 'cursor' command in PATH*).
- Lệnh **Mở với VS Code** cần CLI `code` trên máy đó (Command Palette VS Code → *Shell Command: Install 'code' command in PATH*).
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
3. Kiểm tra badge **clasp x.x.x** trên thanh context. Nếu thiếu, cài lại clasp rồi mở lại app.

### 2. Thanh context — thư mục & Script ID

Hầu hết lệnh (kể cả **login** / **logout**) chỉ bật sau khi đã chọn thư mục. Banner trong panel lệnh sẽ nhắc nếu chưa chọn.

| Khu vực | Việc cần làm |
| --- | --- |
| **Thư mục** | Bấm **Chọn folder** (primary khi chưa chọn) hoặc chọn từ **Gần đây**. **Mở Explorer** / **Mở với Cursor** / **Mở với VS Code** mở folder tương ứng (cần CLI `cursor` / `code` trong PATH). |
| **Script ID** | Dán Script ID, hoặc URL dạng `https://script.google.com/.../projects/<id>/...` — app tự lấy ID. Có thể chọn ID gần đây. |

- Thanh status hiện path (rút gọn), badge **Có .clasp.json** / **Chưa có project**, và Script ID.
- Chưa có `.clasp.json` → dùng **clone** hoặc **create** (tab **Đồng bộ**) trước khi `pull` / `push` / `deploy`.

### 3. Panel lệnh (3 tab)

| Tab | Nội dung |
| --- | --- |
| **Đồng bộ** | Auth (login/logout), Project (clone/pull/push/create, …) |
| **Deploy** | version / deploy / undeploy / open-web-app |
| **Khác** | run function + Custom |

- Nút lệnh giữ tên clasp tiếng Anh; nhóm có phụ đề tiếng Việt ngắn.
- Nút primary đổi theo state: chưa có project + có Script ID → **clone**; đã có project → **push** (Đồng bộ) / **deploy** (Deploy).
- Hover (hoặc focus) nút lệnh → dòng preview dưới panel hiện `clasp …` sắp chạy.

### 4. Đăng nhập Google (tab Đồng bộ → Auth)

1. **Chọn folder** trước (bắt buộc với UI hiện tại).
2. Xem badge trạng thái: **Chưa đăng nhập** / **Đang login: email@…**.
3. (Tùy chọn) Điền **User (--user)** nếu dùng nhiều tài khoản clasp.
4. Bấm **login** — trình duyệt mở để xác thực Google; theo dõi panel **Log**.
5. **logout** khi cần đăng xuất.

### 5. Quy trình thường gặp

**Lấy project có sẵn về máy** (tab **Đồng bộ**)

1. Chọn folder trống (hoặc folder muốn chứa code).
2. Dán Script ID trên thanh context.
3. Bấm **clone** (có thể điền Version nếu cần bản cụ thể).
4. Sau khi clone thành công, folder có `.clasp.json` và mã nguồn.

**Đồng bộ code** (tab **Đồng bộ**)

- **pull** — tải code từ Google về máy.
- **push** — đẩy code local lên Google (thường là nút primary khi đã có project).
- Bật **--force** nếu cần ghi đè (có hộp thoại xác nhận).
- Bật **--watch** để tự push mỗi khi sửa file; bấm **Hủy** trên Log để dừng.

**Tạo project mới** (tab **Đồng bộ**)

1. Chọn folder.
2. Nhập tiêu đề + loại script (standalone, sheets, …).
3. Bấm **create**.

**Deploy** (tab **Deploy**)

1. (Khuyến nghị) **version** — tạo version kèm mô tả.
2. **deploy** — có thể thêm mô tả deploy và/hoặc `deploymentId` để cập nhật deployment cũ.
3. **open-web-app** — mở web app đã deploy (có thể kèm `deploymentId`).
4. **undeploy** — xóa deployment (cần `deploymentId`, có xác nhận).

**Chạy function** (tab **Khác**)

1. Nhập tên function Apps Script.
2. Bấm **run**.

### 6. Panel Log

- Hiện stdout/stderr realtime của lệnh clasp.
- **Copy** — copy toàn bộ log.
- **Clear** — xóa log (khi không có lệnh đang chạy).
- **Hủy** — dừng process đang chạy (hữu ích với `push --watch`).

### 7. Lệnh tùy chỉnh (tab Khác → Custom)

1. Nhập args sau `clasp`, ví dụ: `versions` hoặc `push --watch`.
2. Bấm **Chạy custom** (hover để xem preview `clasp …`).

### 8. Lệnh nguy hiểm

Các lệnh sau luôn hỏi xác nhận trước khi chạy:

- `push --force`
- `undeploy`
- `delete` (xóa project trên Google)
- Custom args chứa `delete`, `undeploy`, hoặc `--force`

### Gợi ý nhanh

1. Chọn folder → **login** (tab Đồng bộ) → dán Script ID → **clone** → sửa code → **push**.
2. Folder đã có project: chọn folder → **pull** / **push** (Đồng bộ) hoặc **deploy** (Deploy).
3. Chỉ một lệnh clasp chạy tại một thời điểm; muốn đổi lệnh thì **Hủy** trước.
