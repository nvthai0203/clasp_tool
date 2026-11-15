# Clasp Tool

Desktop GUI (Electron + React + TypeScript) cho [clasp](https://github.com/google/clasp) — chọn thư mục, dán Script ID, chạy login / clone / pull / push / deploy và xem log realtime.

Giao diện chính: **thanh context** (folder + Script ID) phía trên, panel lệnh bên trái (tab **Đồng bộ** / **Deploy** / **Khác**), panel **Log** bên phải.

Repo: [github.com/nvthai0203/clasp_tool](https://github.com/nvthai0203/clasp_tool)

## Tải về (Windows)

Cách nhanh nhất — **không cần** clone repo hay `npm run dev`:

**[⬇ Tải Clasp.Tool.exe (v1.0.0)](https://github.com/nvthai0203/clasp_tool/releases/download/v1.0.0/Clasp.Tool.exe)**

Sau khi tải:

1. Chạy `Clasp.Tool.exe` → cài / mở **Clasp Tool**.
2. Cài clasp global trên máy đó (app gọi CLI `clasp`, không nhúng sẵn):

```bash
npm i -g @google/clasp
```

3. Kiểm tra: `clasp --version` → mở app, badge trên thanh context phải hiện phiên bản clasp.

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

Người dùng cuối nên tải từ mục **Tải về** / [Releases](https://github.com/nvthai0203/clasp_tool/releases/latest). Phần dưới dành cho maintainer hoặc tự build.

App đóng gói bằng **electron-builder**. Không commit thư mục `release/` lên git (đã có trong `.gitignore`).

### Build trên máy Windows

```bash
npm install
npm run dist
```

Kết quả trong `release/`:

| File / thư mục | Ghi chú |
| --- | --- |
| `Clasp Tool Setup <version>.exe` | Installer NSIS (tên mặc định electron-builder) |
| `win-unpacked/Clasp Tool.exe` | Bản giải nén, chạy trực tiếp |

Version lấy từ `package.json` (hiện `1.0.0`). Khi upload GitHub Release, đặt tên asset **`Clasp.Tool.exe`** (khớp link tải trong README).

### Checklist tạo GitHub Release

1. [ ] Cập nhật `"version"` trong `package.json` nếu bản mới.
2. [ ] Commit / push code lên `main`: [nvthai0203/clasp_tool](https://github.com/nvthai0203/clasp_tool).
3. [ ] Chạy `npm run dist`.
4. [ ] Chuẩn bị file upload tên **`Clasp.Tool.exe`** (đổi tên từ Setup `.exe` hoặc copy từ `win-unpacked\Clasp Tool.exe`).
5. [ ] Tạo release: https://github.com/nvthai0203/clasp_tool/releases/new  
      - Tag: `vX.Y.Z` (ví dụ `v1.0.0`)  
      - Title: `Clasp Tool vX.Y.Z`  
      - Đính kèm `Clasp.Tool.exe`  
      - Publish release
6. [ ] Kiểm tra link tải trong mục **Tải về** (đổi version trong URL nếu tag mới).
7. [ ] Máy thử: tải → chạy → có `clasp` global → badge phiên bản hiện đúng.

GitHub CLI:

```bash
npm run dist
# Đổi tên file cho khớp link README, ví dụ:
copy "release\Clasp Tool Setup 1.0.0.exe" "release\Clasp.Tool.exe"
gh release create v1.0.0 "release/Clasp.Tool.exe" --title "Clasp Tool v1.0.0" --notes "Windows x64. Sau khi cài: npm i -g @google/clasp"
```

### Lưu ý bản đóng gói

- Không nhúng clasp — mỗi máy cần `clasp` trong PATH.
- **Mở với Cursor** / **Mở với VS Code** cần CLI `cursor` / `code`.
- SmartScreen có thể cảnh báo app chưa ký.
- Hiện chỉ build **Windows x64**.

### Chỉ build không đóng gói

```bash
npm run build
npm run preview
```

## Cách dùng

### 1. Chuẩn bị lần đầu

1. Cài clasp global (xem mục **Yêu cầu**).
2. Chạy app: tải [Clasp.Tool.exe](https://github.com/nvthai0203/clasp_tool/releases/download/v1.0.0/Clasp.Tool.exe), hoặc `npm run dev` khi phát triển.
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
