import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên đầy đủ của người dùng' })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '0123456789', description: 'Số điện thoại', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'Test123456', description: 'Mật khẩu (tối thiểu 6 ký tự)' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}

export class SigninDto {
    @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Test123456', description: 'Mật khẩu' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
