import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../database/schemas/user.schema';
import { SigninDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    });
    await newUser.save();

    return { message: 'Tạo người dùng thành công' };
  }

  async signin(dto: SigninDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isPasswordMatch = await this.comparePassword(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const tokens = await this.getTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }

    const isTokenValid = await this.comparePassword(refreshToken, user.refreshTokenHash);
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

  async hashPassword(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async comparePassword(data: string, encrypted: string) {
    return await bcrypt.compare(data, encrypted);
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await this.hashPassword(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  async getTokens(userId: string, email: string, role: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: accessExpiration as any },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: refreshSecret, expiresIn: refreshExpiration as any },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async getAccessToken(userId: string, email: string, role: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';

    return await this.jwtService.signAsync(
      { sub: userId, email, role },
      { secret: accessSecret, expiresIn: accessExpiration as any },
    );
  }
}
