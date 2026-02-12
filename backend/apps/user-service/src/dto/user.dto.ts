import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserProfileDto {
    @ApiProperty({ example: 'Nguyễn Văn B', description: 'Tên đầy đủ', required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ example: '0987654321', description: 'Số điện thoại', required: false })
    @IsOptional()
    @IsString()
    phone?: string;
}

export class UpdateUserRoleDto {
    @ApiProperty({ enum: ['member', 'reporter', 'editor', 'admin'], description: 'Vai trò người dùng' })
    @IsEnum(['member', 'reporter', 'editor', 'admin'])
    role: string;
}

export class UpdateUserStatusDto {
    @ApiProperty({ enum: ['active', 'inactive'], description: 'Trạng thái tài khoản' })
    @IsEnum(['active', 'inactive'])
    status: string;
}
