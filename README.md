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

## Build & đóng gói Windows

```bash
npm run build
npm run dist
```

Installer NSIS nằm trong thư mục `release/`.

## Cách dùng

### 1. Chuẩn bị lần đầu

1. Cài clasp global (xem mục **Yêu cầu**).
2. Chạy app: `npm run dev` (dev) hoặc mở bản đã cài từ `release/`.
3. Kiểm tra badge góc trên — phải hiện phiên bản clasp. Nếu thiếu, cài lại clasp rồi mở lại app.

### 2. Chọn thư mục & Script ID

| Khu vực | Việc cần làm |
| --- | --- |
| **Thư mục làm việc** | Bấm **Chọn folder** (hoặc chọn từ danh sách gần đây). Nút **Mở** mở folder trong Explorer. |
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
