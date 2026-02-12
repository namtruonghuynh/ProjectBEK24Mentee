import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AccessTokenGuard, RolesGuard, Roles } from '@app/shared';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Chuyên mục')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    // ==================== PUBLIC ENDPOINTS ====================

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách chuyên mục' })
    async findAll(@Req() req: Request) {
        return this.categoryService.findAll(req.query);
    }

    @Get('tree')
    @ApiOperation({ summary: 'Lấy danh sách chuyên mục dạng cây (cha-con)' })
    async findTree() {
        return this.categoryService.findTree();
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Lấy chi tiết chuyên mục theo slug' })
    async findBySlug(@Param('slug') slug: string) {
        return this.categoryService.findBySlug(slug);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết chuyên mục theo ID' })
    async findById(@Param('id') id: string) {
        return this.categoryService.findById(id);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @Post()
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Tạo chuyên mục mới (Admin)' })
    async create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Patch(':id')
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Cập nhật chuyên mục (Admin)' })
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Xóa chuyên mục (Admin)' })
    async delete(@Param('id') id: string) {
        return this.categoryService.delete(id);
    }
}
