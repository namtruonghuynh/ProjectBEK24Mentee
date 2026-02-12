import { Controller, HttpCode, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthOnly } from './decorators/auth-only.decorator';
import { JwtPayload, JwtPayloadWithRefreshToken } from '@app/shared';

@ApiTags('Xác thực')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    @ApiOperation({
        summary: 'Đăng ký tài khoản mới',
        description: 'Tạo tài khoản người dùng mới với email và password.'
    })
    @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
    @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
    async signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    @Post('signin')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Đăng nhập và nhận tokens',
        description: 'Đăng nhập với email và password. Trả về access_token và refresh_token.'
    })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
    async signin(@Body() dto: SigninDto) {
        return this.authService.signin(dto);
    }

    @AuthOnly()
    @Post('signout')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Đăng xuất',
        description: 'Vô hiệu hóa refresh token.'
    })
    async signout(@Req() req: Request) {
        const user = req.user as JwtPayload;
        return this.authService.signout(user.sub);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @HttpCode(200)
    @ApiBearerAuth('refresh-token')
    @ApiOperation({
        summary: 'Làm mới access token',
        description: 'Sử dụng refresh token để lấy access token mới.'
    })
    async refresh(@Req() req: Request) {
        const user = req.user as JwtPayloadWithRefreshToken;
        return this.authService.refresh(user.sub, user.refreshToken);
    }
}
