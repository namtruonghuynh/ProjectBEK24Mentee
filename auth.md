Luồng Xác Thực (Authentication Flow) - Auth Service
Tài liệu này mô tả chi tiết luồng xử lý xác thực trong auth-service.

Tổng quan
Hệ thống sử dụng cơ chế JWT (JSON Web Token) với cặp token:

Access Token: Dùng để xác thực các request, có thời gian sống ngắn (mặc định 15 phút).
Refresh Token: Dùng để lấy Access Token mới khi cái cũ hết hạn, có thời gian sống dài (mặc định 7 ngày). Refresh Token được lưu dưới dạng hash trong database để bảo mật.
Các luồng chính
1. Đăng ký (Sign Up)
Người dùng tạo tài khoản mới.

sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant Database

    Client->>AuthController: POST /auth/signup {email, password, ...}
    AuthController->>AuthService: signup(dto)
    AuthService->>Database: Find user by email
    alt Email already exists
        Database-->>AuthService: User found
        AuthService-->>Client: 409 Conflict
    else Email available
        AuthService->>Database: Create & Save new User
        Database-->>AuthService: User created
        AuthService-->>Client: 201 Created
    end
2. Đăng nhập (Sign In)
Người dùng đăng nhập để nhận cặp token.

sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant Database

    Client->>AuthController: POST /auth/signin {email, password}
    AuthController->>AuthService: signin(dto)
    AuthService->>Database: Find user by email
    alt User not found or Password invalid
        AuthService-->>Client: 401 Unauthorized
    else Valid credentials
        AuthService->>AuthService: Generate Tokens (Access, Refresh)
        AuthService->>AuthService: Hash Refresh Token
        AuthService->>Database: Update user with refreshTokenHash
        AuthService-->>Client: 200 OK {access_token, refresh_token, user}
    end
3. Làm mới Token (Refresh Token)
Sử dụng Refresh Token để lấy Access Token mới.

Yêu cầu: Header Authorization: Bearer <refresh_token>

sequenceDiagram
    participant Client
    participant RefreshTokenGuard
    participant AuthController
    participant AuthService
    participant Database

    Client->>RefreshTokenGuard: POST /auth/refresh (Header: Bearer refresh_token)
    RefreshTokenGuard->>RefreshTokenGuard: Validate JWT signature & expiration
    alt Invalid Token
        RefreshTokenGuard-->>Client: 401 Unauthorized
    else Valid Token
        RefreshTokenGuard->>AuthController: Request with User Payload + RefreshToken
        AuthController->>AuthService: refresh(userId, refreshToken)
        AuthService->>Database: Find user by ID
        alt User not found or No Hash stored
            AuthService-->>Client: 401 Unauthorized (Revoked)
        else User found
            AuthService->>AuthService: Compare provided token vs stored hash
            alt Hash mismatch
                AuthService-->>Client: 401 Unauthorized
            else Valid
                AuthService->>AuthService: Generate new Access Token
                AuthService-->>Client: 200 OK {access_token}
            end
        end
    end
4. Đăng xuất (Sign Out)
Xóa Refresh Token hash trong database để vô hiệu hóa phiên đăng nhập.

Yêu cầu: Header Authorization: Bearer <access_token>

sequenceDiagram
    participant Client
    participant AuthOnlyGuard
    participant AuthController
    participant AuthService
    participant Database

    Client->>AuthOnlyGuard: POST /auth/signout (Header: Bearer access_token)
    AuthOnlyGuard->>AuthOnlyGuard: Validate JWT signature
    alt Invalid Token
        AuthOnlyGuard-->>Client: 401 Unauthorized
    else Valid Token
        AuthOnlyGuard->>AuthController: Request with User Payload
        AuthController->>AuthService: signout(userId)
        AuthService->>Database: Update user (refreshTokenHash = null)
        AuthService-->>Client: 200 OK {message}
    end
Chi tiết Implement
Files quan trọng
src/auth.controller.ts: Định nghĩa các endpoints.
src/auth.service.ts: Chứa logic nghiệp vụ (hashing, token generation, interaction with DB).
src/strategies/accessToken.strategy.ts: Strategy cho Passport, dùng để validate Access Token.
src/strategies/refreshToken.strategy.ts: Strategy cho Passport, dùng để validate Refresh Token và extract nó từ header.
src/guards/refreshToken.guard.ts: Guard sử dụng RefreshTokenStrategy.
src/decorators/auth-only.decorator.ts: Decorator tiện ích kết hợp AccessTokenGuard và Swagger annotations.
Bảo mật
Access Token: JWT signed với JWT_ACCESS_SECRET, thời gian sống ngắn.
Refresh Token: JWT signed với JWT_REFRESH_SECRET, thời gian sống dài. Chỉ lưu hash trong DB (bcrypt), giúp bảo vệ nếu DB bị lộ, kẻ tấn công không thể dùng hash để tạo token giả hoặc dùng hash như token thật được (vì cần token gốc để verify với hash).
Password: Hash bằng bcrypt trước khi lưu.
