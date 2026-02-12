import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { User, UserDocument } from '@app/shared';
import { SigninDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signup(dto: SignupDto) {
        const existingUser = await this.userModel.findOne({ email: dto.email });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }

        const newUser = new this.userModel(dto);
        await newUser.save();

        return { message: 'Tạo người dùng thành công' };
    }

    async signin(dto: SigninDto) {
        const user = await this.userModel.findOne({ email: dto.email });
        if (!user) {
            throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
        }

        const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
        }

        const tokens = await this.getTokens(user._id.toString(), user.email, user.role);
        await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

        return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            user: this.sanitizeUser(user),
        };
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.userModel.findById(userId);
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Refresh token đã bị thu hồi');
        }

        const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!isTokenValid) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }

        const accessToken = await this.getAccessToken(user._id.toString(), user.email, user.role);
        return { access_token: accessToken };
    }

    async signout(userId: string) {
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
        return { message: 'Đăng xuất thành công' };
    }

    async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(refreshToken, salt);
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
    }

    async getTokens(userId: string, email: string, role: string) {
        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
        const accessExpiration = (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as JwtSignOptions['expiresIn'];
        const refreshExpiration = (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as JwtSignOptions['expiresIn'];

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, role },
                { secret: accessSecret, expiresIn: accessExpiration },
            ),
            this.jwtService.signAsync(
                { sub: userId, email, role },
                { secret: refreshSecret, expiresIn: refreshExpiration },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    async getAccessToken(userId: string, email: string, role: string) {
        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const accessExpiration = (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as JwtSignOptions['expiresIn'];

        return await this.jwtService.signAsync(
            { sub: userId, email, role },
            { secret: accessSecret, expiresIn: accessExpiration },
        );
    }

    private sanitizeUser(user: UserDocument) {
        const userObj = user.toObject();
        const { password, refreshTokenHash, ...sanitized } = userObj;
        return sanitized;
    }
}
