# Clasp Tool

Desktop GUI (Electron + React + TypeScript) cho [clasp](https://github.com/google/clasp) — chọn thư mục, dán Script ID, chạy login / clone / pull / push / deploy và xem log realtime.

Giao diện chính: **thanh context** (folder + Script ID) phía trên, panel lệnh bên trái (tab **Đồng bộ** / **Deploy** / **Khác**), panel **Log** bên phải.

Repo: [github.com/nvthai0203/clasp_tool](https://github.com/nvthai0203/clasp_tool)

## Tải về (Windows)

Cách nhanh nhất — **không cần** `npm run dev`:

1. Tải trực tiếp: **[Clasp.Tool.exe](https://github.com/nvthai0203/clasp_tool/releases/download/v1.0.0/Clasp.Tool.exe)**  
   (hoặc mở trang **[Releases — Latest](https://github.com/nvthai0203/clasp_tool/releases/latest)** rồi chọn asset).
2. Chạy file `.exe` → cài / mở **Clasp Tool**.
3. Trên máy đó vẫn cần cài clasp global (app gọi CLI `clasp`):

```bash
npm i -g @google/clasp
```

Kiểm tra: `clasp --version`. Mở app — badge trên thanh context phải hiện phiên bản clasp.

> Link tải trực tiếp (`v1.0.0`):  
> https://github.com/nvthai0203/clasp_tool/releases/download/v1.0.0/Clasp.Tool.exe  
> Nếu 404 → dùng trang [Releases](https://github.com/nvthai0203/clasp_tool/releases).

Windows Defender / SmartScreen có thể cảnh báo app chưa ký code — *More info* → *Run anyway* nếu bạn tin nguồn (repo này).

## Yêu cầu

- Node.js 18+ (cần để cài clasp; cũng cần nếu tự build từ source)
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

## Đóng gói & phát hành (Windows)

Người dùng cuối nên tải từ [Releases](https://github.com/nvthai0203/clasp_tool/releases/latest) (xem mục **Tải về**). Mục này dành cho người **tự build** hoặc **maintainer** publish bản mới.

App đóng gói bằng **electron-builder** (NSIS `.exe`). Không commit thư mục `release/` lên git (đã có trong `.gitignore`).

### Build installer trên máy Windows

1. Cài [Node.js 18+](https://nodejs.org/) (có `npm`).
2. Clone/mở repo, cài dependency:

```bash
npm install
```

3. Đảm bảo binary Electron đã có (nếu lỗi, xem mục **Phát triển**).
4. Chạy:

```bash
npm run dist
```

Lệnh này: build (`out/`) rồi đóng gói Windows x64 → `release/`.

| File trong `release/` | Mục đích |
| --- | --- |
| `Clasp Tool Setup x.x.x.exe` | Installer — upload lên GitHub Release |
| `win-unpacked/` | Chạy trực tiếp (portable-ish), thường không cần upload |

Version trong tên file lấy từ `version` trong `package.json` (hiện `1.0.0` → `Clasp Tool Setup 1.0.0.exe`).

### Checklist tạo GitHub Release

Làm lần lượt khi muốn người khác **bấm tải là dùng**:

1. [ ] Cập nhật `"version"` trong `package.json` (ví dụ `1.0.0` → `1.0.1`) nếu đây là bản mới.
2. [ ] Commit / push code lên `main` (repo: [nvthai0203/clasp_tool](https://github.com/nvthai0203/clasp_tool)).
3. [ ] Chạy `npm run dist` trên máy Windows; xác nhận có file  
      `release/Clasp Tool Setup <version>.exe`.
4. [ ] Trên GitHub: **Releases** → **Draft a new release**  
      https://github.com/nvthai0203/clasp_tool/releases/new
5. [ ] **Choose a tag**: tạo tag dạng `v1.0.0` (khớp version; Target: `main`).
6. [ ] **Release title**: ví dụ `Clasp Tool v1.0.0`.
7. [ ] Viết ngắn mô tả (changelog): UI mới, bugfix, v.v.
8. [ ] **Attach binaries**: kéo thả `Clasp Tool Setup <version>.exe` vào vùng assets  
      (**không** upload cả thư mục `win-unpacked`).
9. [ ] Bỏ chọn pre-release (trừ khi cố ý phát hành thử).
10. [ ] Bấm **Publish release**.
11. [ ] Kiểm tra:
    - [ ] Trang [latest](https://github.com/nvthai0203/clasp_tool/releases/latest) mở được.
    - [ ] Tải `.exe` về, cài thử.
    - [ ] Máy thử có `clasp` global; mở app thấy badge phiên bản clasp.
12. [ ] (Tuỳ chọn) Cập nhật link tải trực tiếp trong mục **Tải về** của README nếu đổi version/tên file.

Dùng GitHub CLI (nếu đã `gh auth login`):

```bash
npm run dist
gh release create v1.0.0 "release/Clasp Tool Setup 1.0.0.exe" --title "Clasp Tool v1.0.0" --notes "Bản Windows x64. Sau khi cài: npm i -g @google/clasp"
```

### Lưu ý khi dùng bản đóng gói

- Clasp Tool **không nhúng** clasp; mỗi máy vẫn cần `clasp` trong PATH.
- **Mở với Cursor** / **Mở với VS Code** cần CLI `cursor` / `code` trong PATH.
- SmartScreen có thể cảnh báo app chưa ký code.
- Hiện chỉ build **Windows x64**.

### Chỉ build không đóng gói

```bash
npm run build
npm run preview
```

## Cách dùng

### 1. Chuẩn bị lần đầu

1. Cài clasp global (xem mục **Yêu cầu**).
2. Chạy app: tải installer từ [Releases](https://github.com/nvthai0203/clasp_tool/releases/latest), hoặc `npm run dev` khi phát triển.
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
