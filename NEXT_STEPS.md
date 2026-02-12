# Kế Hoạch Phát Triển Tiếp Theo

Sau khi hoàn thành **Auth Service**, hệ thống đã có khả năng xác thực và phân quyền cơ bản. Các bước tiếp theo sẽ tập trung vào việc kiện toàn các service vệ tinh và core service.

Dưới đây là lộ trình đề xuất theo thứ tự ưu tiên:

## 1. User Service (Ưu tiên cao nhất)
**Mục tiêu**: Quản lý thông tin người dùng, profile, và phân quyền nâng cao.
- **Lý do**: Service này dùng chung database `auth-db` với Auth Service. Cần hoàn thiện sớm để Article Service có thể tham chiếu thông tin tác giả.
- **Công việc**:
    - [ ] Implement CRUD User (Get Profile, Update Profile).
    - [ ] Implement Admin features (Get All Users, Block/Unblock User, Change Role).
    - [ ] Chia sẻ `UserSchema` và model từ `libs/shared` hoặc refactor để dùng chung code hiệu quả.

## 2. Category Service
**Mục tiêu**: Quản lý danh mục bài viết.
- **Lý do**: Article Service cần Category ID để tạo bài viết. Service này độc lập và logic đơn giản, dễ triển khai nhanh.
- **Công việc**:
    - [ ] Implement CRUD Category.
    - [ ] Xử lý logic phân cấp danh mục (Parent/Child).
    - [ ] API lấy danh sách category (Public).

## 3. Article Service (Core Feature)
**Mục tiêu**: Quản lý bài viết - chức năng chính của hệ thống.
- **Lý do**: Đây là service phức tạp nhất, cần có User và Category trước để đảm bảo tính toàn vẹn dữ liệu.
- **Công việc**:
    - [ ] Implement CRUD Article.
    - [ ] Logic tạo slug tự động.
    - [ ] Workflow duyệt bài: `Draft` -> `Pending` -> `Published` / `Rejected`.
    - [ ] API tìm kiếm bài viết.

## 4. API Gateway Integration
**Mục tiêu**: Public các API của các service trên ra ngoài internet.
- **Lý do**: Client (Frontend) chỉ giao tiếp qua Gateway.
- **Công việc**:
    - [ ] Cấu hình routes trong Gateway trỏ đến User, Category, Article services.
    - [ ] Áp dụng Auth Guard cho các routes bảo mật (ví dụ: tạo bài viết, sửa profile).

## 5. Các Service Khác (Giai đoạn sau)
- **Interaction Service**: Comment, Bookmark (phụ thuộc Article).
- **Statistics Service**: Báo cáo số liệu (phụ thuộc tất cả các service trên).

---

## Đề Xuất Hành Động Ngay
Chúng ta nên bắt đầu ngay với **User Service**.
Bạn có thể cập nhật file `task.md` để bắt đầu task: **"Implement User Service"**.
