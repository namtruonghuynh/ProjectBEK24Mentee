import { Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthOnly } from '../../common/decorators/auth-only.decorator';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('Xác thực')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản người dùng mới với email và password. Password phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
  })
  @ApiBody({
    type: SignupDto,
    examples: {
      user: {
        summary: 'Đăng ký user thường',
        value: {
          email: 'user@example.com',
          password: 'User@123456',
          fullName: 'Nguyễn Văn A'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo người dùng thành công',
    schema: {
      example: {
        message: 'Tạo người dùng thành công'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ (email sai format hoặc password yếu)' })
  async signup(@Req() req: Request, @Res() res: Response) {
    const dto = req.body;
    const result = await this.authService.signup(dto);
    res.json(result);
  }

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Đăng nhập và nhận tokens',
    description: 'Đăng nhập với email và password. Trả về access_token (15 phút) và refresh_token (7 ngày). Lưu access_token để gọi API và refresh_token để làm mới token khi hết hạn.'
  })
  @ApiBody({
    type: SigninDto,
    examples: {
      user: {
        summary: 'Đăng nhập user thường',
        value: {
          email: 'user@example.com',
          password: 'User@123456'
        }
      },
      admin: {
        summary: 'Đăng nhập admin',
        value: {
          email: 'superadmin@example.com',
          password: 'SuperAdmin@123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về access_token và refresh_token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          fullName: 'Nguyễn Văn A',
          role: 'user'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  async signin(@Req() req: Request, @Res() res: Response) {
    const dto = req.body;
    const result = await this.authService.signin(dto);
    res.json(result);
  }

  @AuthOnly()
  @Post('signout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Đăng xuất và vô hiệu hóa refresh token',
    description: 'Đăng xuất khỏi hệ thống. Xóa refresh token khỏi database để không thể làm mới access token nữa. Access token hiện tại vẫn còn hiệu lực cho đến khi hết hạn (15 phút).'
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    schema: {
      example: {
        message: 'Đăng xuất thành công'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async signout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const userId = user['sub'];
    const result = await this.authService.signout(userId);
    res.json(result);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Làm mới access token bằng refresh token',
    description: `Lấy access token mới khi token cũ hết hạn. 
    
**Cách sử dụng:**
1. Lấy refresh_token từ response của /auth/signin
2. Gửi refresh_token qua Authorization header: "Bearer <refresh_token>"
3. Nhận access_token mới (có role mới nhất từ database)

**Lưu ý:** Trong Swagger UI, click "Authorize" và nhập refresh_token thay vì access_token để test endpoint này.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Tạo access token mới thành công',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã bị thu hồi' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const userId = user['sub'];
    const refreshToken = user['refreshToken'];
    const result = await this.authService.refresh(userId, refreshToken);
    res.json(result);
  }
}
