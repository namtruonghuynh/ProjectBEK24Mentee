# 📁 Cấu Trúc Thư Mục Dự Án — News Management System

## Tổng Quan

```
ProjectBEK24Mentee/
├── backend/                          # Toàn bộ backend microservices
│   ├── api-gateway/                  # API Gateway (Port 3000)
│   ├── auth-service/                 # Auth Service (Port 3001)
│   ├── user-service/                 # User Service (Port 3002)
│   ├── article-service/              # Article Service (Port 3003)
│   ├── category-service/             # Category Service (Port 3004)
│   ├── interaction-service/          # Interaction Service (Port 3005)
│   ├── statistics-service/           # Statistics Service (Port 3006)
│   └── shared/                       # Code dùng chung giữa các service
├── docker-compose.yml                # Orchestrate tất cả services
├── .env                              # Biến môi trường chung
└── README.md                         # Tài liệu dự án
```

---

## Chi Tiết Từng Service

### 1. API Gateway (`api-gateway/`) — Port 3000

> Điểm truy cập duy nhất của hệ thống. Xử lý routing, xác thực JWT, phân quyền RBAC, rate limiting.

```
api-gateway/
├── src/
│   ├── middlewares/
│   │   ├── auth.middleware.ts            # Xác thực JWT token
│   │   ├── rbac.middleware.ts            # Phân quyền theo vai trò (RBAC)
│   │   ├── rateLimiter.middleware.ts     # Giới hạn tần suất truy cập
│   │   ├── cors.middleware.ts            # Cấu hình CORS
│   │   ├── logger.middleware.ts          # Ghi log request/response
│   │   └── errorHandler.middleware.ts    # Xử lý lỗi tập trung
│   │
│   ├── routes/
│   │   ├── index.ts                      # Tổng hợp tất cả routes
│   │   ├── auth.routes.ts                # /api/auth/*       → Auth Service
│   │   ├── user.routes.ts                # /api/users/*      → User Service
│   │   ├── article.routes.ts             # /api/articles/*   → Article Service
│   │   ├── category.routes.ts            # /api/categories/* → Category Service
│   │   ├── comment.routes.ts             # /api/comments/*   → Interaction Service
│   │   ├── bookmark.routes.ts            # /api/bookmarks/*  → Interaction Service
│   │   └── statistics.routes.ts          # /api/statistics/* → Statistics Service
│   │
│   ├── utils/
│   │   └── proxy.ts                      # HTTP proxy utility (forward request)
│   │
│   ├── config/
│   │   ├── index.ts                      # Load env, export config object
│   │   └── services.ts                   # URL các downstream services
│   │
│   ├── app.ts                            # Express app setup
│   └── server.ts                         # Khởi động server
│
├── .env                                  # PORT, JWT_SECRET, SERVICE_URLS
├── package.json
└── tsconfig.json
```

---

### 2. Auth Service (`auth-service/`) — Port 3001

> Xử lý xác thực: đăng ký, đăng nhập, đăng xuất, quản lý JWT token.

```
auth-service/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts            # Xử lý request: register, login, logout
│   │
│   ├── services/
│   │   └── auth.service.ts               # Logic nghiệp vụ xác thực
│   │
│   ├── schemas/
│   │   └── user.schema.ts                 # Mongoose schema: User
│   │
│   ├── middlewares/
│   │   └── validate.middleware.ts        # Validate dữ liệu đầu vào
│   │
│   ├── validators/
│   │   └── auth.validator.ts             # Validation rules (register, login)
│   │
│   ├── utils/
│   │   ├── jwt.util.ts                   # Tạo & verify JWT token
│   │   └── password.util.ts              # Hash & compare password (bcrypt)
│   │
│   ├── config/
│   │   ├── index.ts                      # Config chung
│   │   └── db.ts                         # Kết nối MongoDB
│   │
│   ├── app.ts                            # Express app setup
│   └── server.ts                         # Khởi động server
│
├── .env                                  # PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN
├── package.json
└── tsconfig.json
```

**User Schema:**
| Field | Type | Constraint |
|---|---|---|
| `username` | String | unique, 3-50 ký tự |
| `email` | String | unique, email hợp lệ |
| `password` | String | hash bcrypt, min 8 ký tự gốc |
| `fullName` | String | bắt buộc |
| `avatar` | String | URL, tùy chọn |
| `role` | Enum | `member`, `reporter`, `editor`, `admin` |
| `status` | Enum | `active`, `inactive` |
| `refreshToken` | String | tùy chọn |

---

### 3. User Service (`user-service/`) — Port 3002

> Quản lý người dùng: xem, sửa profile, thay đổi vai trò, khóa/mở khóa tài khoản (Admin).

```
user-service/
├── src/
│   ├── controllers/
│   │   └── user.controller.ts            # Xử lý request CRUD user
│   │
│   ├── services/
│   │   └── user.service.ts               # Logic nghiệp vụ quản lý user
│   │
│   ├── schemas/
│   │   └── user.schema.ts                 # Mongoose schema: User (dùng chung DB với Auth)
│   │
│   ├── validators/
│   │   └── user.validator.ts             # Validation rules (update profile, change role)
│   │
│   ├── config/
│   │   ├── index.ts                      # Config chung
│   │   └── db.ts                         # Kết nối MongoDB (cùng DB với Auth Service)
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env                                  # PORT, MONGO_URI (cùng auth-db)
├── package.json
└── tsconfig.json
```

> ⚠️ **Lưu ý:** Auth Service và User Service **dùng chung MongoDB database** (`auth-db`) vì cùng thao tác trên collection `users`.

---

### 4. Article Service (`article-service/`) — Port 3003

> Service lớn nhất — quản lý toàn bộ vòng đời bài viết: tạo, sửa, xóa, gửi duyệt, duyệt, từ chối, gỡ bài, tìm kiếm.

```
article-service/
├── src/
│   ├── controllers/
│   │   └── article.controller.ts         # Xử lý request CRUD + workflow bài viết
│   │
│   ├── services/
│   │   └── article.service.ts            # Logic nghiệp vụ bài viết
│   │
│   ├── schemas/
│   │   └── article.schema.ts              # Mongoose schema: Article
│   │
│   ├── validators/
│   │   └── article.validator.ts          # Validation rules (create, update, search)
│   │
│   ├── utils/
│   │   └── slug.util.ts                  # Tạo slug từ title (URL-friendly)
│   │
│   ├── config/
│   │   ├── index.ts
│   │   └── db.ts                         # Kết nối MongoDB (article-db)
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env                                  # PORT, MONGO_URI
├── package.json
└── tsconfig.json
```

**Article Schema:**
| Field | Type | Constraint |
|---|---|---|
| `title` | String | bắt buộc, max 200 ký tự |
| `slug` | String | unique, auto-generate |
| `content` | String | bắt buộc |
| `excerpt` | String | tùy chọn |
| `thumbnail` | String | URL, tùy chọn |
| `author` | Object | `{ userId, name }` |
| `category` | Object | `{ categoryId, name }` |
| `tags` | [String] | tùy chọn |
| `status` | Enum | `draft`, `pending`, `published`, `rejected`, `unpublished` |
| `rejectionReason` | String | khi bị từ chối |
| `viewCount` | Number | default: 0 |
| `publishedAt` | Date | thời điểm xuất bản |

---

### 5. Category Service (`category-service/`) — Port 3004

> Quản lý chuyên mục tin tức: CRUD, cấu trúc phân cấp cha-con (tối đa 2 cấp).

```
category-service/
├── src/
│   ├── controllers/
│   │   └── category.controller.ts        # Xử lý request CRUD chuyên mục
│   │
│   ├── services/
│   │   └── category.service.ts           # Logic nghiệp vụ chuyên mục
│   │
│   ├── schemas/
│   │   └── category.schema.ts             # Mongoose schema: Category
│   │
│   ├── validators/
│   │   └── category.validator.ts         # Validation rules
│   │
│   ├── config/
│   │   ├── index.ts
│   │   └── db.ts                         # Kết nối MongoDB (category-db)
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── package.json
└── tsconfig.json
```

**Category Schema:**
| Field | Type | Constraint |
|---|---|---|
| `name` | String | unique, max 100 ký tự |
| `slug` | String | unique, auto-generate |
| `description` | String | tùy chọn |
| `parent` | ObjectId | null = top-level, max 2 cấp |
| `articleCount` | Number | đếm số bài viết |
| `order` | Number | thứ tự hiển thị |

---

### 6. Interaction Service (`interaction-service/`) — Port 3005

> Xử lý tương tác người dùng: bình luận (Comment) và lưu bài (Bookmark).

```
interaction-service/
├── src/
│   ├── controllers/
│   │   ├── comment.controller.ts         # Xử lý request bình luận
│   │   └── bookmark.controller.ts        # Xử lý request bookmark
│   │
│   ├── services/
│   │   ├── comment.service.ts            # Logic nghiệp vụ bình luận
│   │   └── bookmark.service.ts           # Logic nghiệp vụ bookmark
│   │
│   ├── schemas/
│   │   ├── comment.schema.ts              # Mongoose schema: Comment
│   │   └── bookmark.schema.ts             # Mongoose schema: Bookmark
│   │
│   ├── validators/
│   │   ├── comment.validator.ts          # Validation rules bình luận
│   │   └── bookmark.validator.ts         # Validation rules bookmark
│   │
│   ├── config/
│   │   ├── index.ts
│   │   └── db.ts                         # Kết nối MongoDB (interaction-db)
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── package.json
└── tsconfig.json
```

**Comment Schema:**
| Field | Type | Constraint |
|---|---|---|
| `content` | String | bắt buộc, max 1000 ký tự |
| `user` | Object | `{ userId, name }` |
| `articleId` | ObjectId | bắt buộc |

**Bookmark Schema:**
| Field | Type | Constraint |
|---|---|---|
| `userId` | ObjectId | bắt buộc |
| `article` | Object | `{ articleId, title }` |
| Unique Index | — | `{ userId, article.articleId }` — không cho bookmark trùng |

---

### 7. Statistics Service (`statistics-service/`) — Port 3006

> Tổng hợp thống kê và báo cáo: bài viết, người dùng, lượt xem, top bài viết.

```
statistics-service/
├── src/
│   ├── controllers/
│   │   └── statistics.controller.ts      # Xử lý request thống kê
│   │
│   ├── services/
│   │   └── statistics.service.ts         # Logic tổng hợp dữ liệu
│   │
│   ├── utils/
│   │   └── httpClient.ts                 # Gọi HTTP đến các service khác
│   │
│   ├── config/
│   │   ├── index.ts
│   │   └── services.ts                   # URL các service cần gọi
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env                                  # PORT, các SERVICE URLs
├── package.json
└── tsconfig.json
```

> ℹ️ Statistics Service **không có database riêng** — gọi HTTP đến Article, User, Interaction Service để aggregate dữ liệu.

---

### 8. Shared (`shared/`)

> Code dùng chung giữa tất cả các service.

```
shared/
├── types/
│   ├── user.types.ts                     # Interface IUser, UserRole, UserStatus
│   ├── article.types.ts                  # Interface IArticle, ArticleStatus
│   ├── category.types.ts                 # Interface ICategory
│   ├── comment.types.ts                  # Interface IComment
│   ├── bookmark.types.ts                # Interface IBookmark
│   └── common.types.ts                   # PaginationQuery, ApiResponse, etc.
│
├── constants/
│   ├── roles.ts                          # Enum vai trò: MEMBER, REPORTER, EDITOR, ADMIN
│   ├── articleStatus.ts                  # Enum trạng thái: DRAFT, PENDING, PUBLISHED, ...
│   └── httpStatus.ts                     # HTTP status codes
│
├── utils/
│   ├── response.util.ts                  # Chuẩn hóa API response format
│   ├── pagination.util.ts                # Helper phân trang
│   └── apiError.ts                       # Custom error class
│
└── middlewares/
    └── validate.middleware.ts            # Middleware validate dùng chung
```

---

## File Cấu Hình Gốc

### `docker-compose.yml`

```
ProjectBEK24Mentee/
├── docker-compose.yml                    # Orchestrate tất cả services + MongoDB
```

Bao gồm:
- 7 containers cho 7 services (gateway + 6 microservices)
- 3 containers MongoDB (auth-db, article-db, interaction-db)
- Network chung cho các service giao tiếp

### `.env` (root)

```
# MongoDB
MONGO_AUTH_URI=mongodb://localhost:27017/auth-db
MONGO_ARTICLE_URI=mongodb://localhost:27017/article-db
MONGO_CATEGORY_URI=mongodb://localhost:27017/category-db
MONGO_INTERACTION_URI=mongodb://localhost:27017/interaction-db

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Service Ports
GATEWAY_PORT=3000
AUTH_PORT=3001
USER_PORT=3002
ARTICLE_PORT=3003
CATEGORY_PORT=3004
INTERACTION_PORT=3005
STATISTICS_PORT=3006
```

---

## Tổng Kết Cấu Trúc

| Service | Port | Database | Số file chính |
|---|---|---|---|
| API Gateway | 3000 | — (không có DB) | ~10 files |
| Auth Service | 3001 | `auth-db` | ~8 files |
| User Service | 3002 | `auth-db` (chung) | ~6 files |
| Article Service | 3003 | `article-db` | ~8 files |
| Category Service | 3004 | `category-db` | ~6 files |
| Interaction Service | 3005 | `interaction-db` | ~10 files |
| Statistics Service | 3006 | — (gọi service khác) | ~5 files |
| Shared | — | — | ~10 files |

**Tổng cộng: ~63 files TypeScript** cần phát triển.
