import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Thời sự', description: 'Tên chuyên mục', maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name!: string;

    @ApiProperty({ example: 'Tin nóng hàng ngày', description: 'Mô tả chuyên mục', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID chuyên mục cha', required: false })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiProperty({ example: 0, description: 'Thứ tự hiển thị', required: false })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({ example: true, description: 'Trạng thái hoạt động', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
