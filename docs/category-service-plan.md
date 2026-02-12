# Kế hoạch triển khai Category Service

Tài liệu này mô tả chi tiết các bước để phát triển `category-service` dựa trên yêu cầu SRS.

## 1. Mục tiêu
Xây dựng dịch vụ quản lý chuyên mục bài viết, hỗ trợ phân cấp (tối đa 2 cấp) và tích hợp bảo mật qua API Gateway.

## 2. Thiết kế Cơ sở dữ liệu (Schema)
Sử dụng MongoDB (Mongoose). Chuyên mục sẽ được lưu trong collection `categories`.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Unique, Max 100 | Tên chuyên mục |
| `slug` | String | Required, Unique | Slug dùng cho URL |
| `description` | String | Optional | Mô tả ngắn |
| `parentId` | ObjectId | Optional | ID của chuyên mục cha |
| `articleCount` | Number | Default: 0 | Số bài viết thuộc chuyên mục |
| `order` | Number | Default: 0 | Thứ tự hiển thị |

## 3. Các API Endpoints

### Công khai (Public)
- `GET /categories`: Lấy danh sách chuyên mục (dạng phẳng hoặc cây).
- `GET /categories/:slug`: Lấy chi tiết chuyên mục theo slug.
- `GET /categories/trees`: Lấy danh sách chuyên mục theo cấu trúc cha-con.

### Quản trị (Admin - Yêu cầu Role 'admin' hoặc 'editor')
- `POST /categories`: Tạo chuyên mục mới.
- `PATCH /categories/:id`: Cập nhật thông tin chuyên mục.
- `DELETE /categories/:id`: Xóa chuyên mục.
  - **Lưu ý**: Cần kiểm tra nếu còn bài viết thì không cho xóa (hoặc yêu cầu chuyển bài).

## 4. Kế hoạch thực hiện

### Giai đoạn 1: Khởi tạo & Schema
- [ ] Định nghĩa `CategorySchema` trong `shared` (để các service khác như `article-service` có thể dùng).
- [ ] Cấu hình `CategoryModule` kết nối MongoDB.

### Giai đoạn 2: Phát triển DTO & Controller
- [ ] Tạo `CreateCategoryDto`, `UpdateCategoryDto` (sử dụng `class-validator`).
- [ ] Xây dựng `CategoryController` với đầy đủ các route.
- [ ] Tích hợp `AccessTokenGuard` và `RolesGuard` từ `shared`.

### Giai đoạn 3: Xử lý Logic Nghiệp vụ (Service)
- [ ] Viết logic tự động tạo `slug` từ `name`.
- [ ] Xử lý phân cấp: Đảm bảo không quá 2 cấp (không được chọn `parentId` là một chuyên mục con).
- [ ] Cập nhật `articleCount` (Sẽ thực hiện qua Event Bus khi làm `article-service`).

### Giai đoạn 4: Kiểm thử & Tài liệu
- [ ] Cấu hình Swagger UI (`/api/docs`).
- [ ] Kiểm thử các trường hợp: Tạo trùng tên, xóa chuyên mục đang có con, check quyền Admin.

## 5. Ràng buộc quan trọng (NFR)
- Tên chuyên mục duy nhất.
- Hỗ trợ cha-con tối đa 2 cấp.
- Khi xóa chuyên mục: Ràng buộc toàn vẹn dữ liệu.
