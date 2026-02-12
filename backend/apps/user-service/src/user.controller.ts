import { Body, Controller, Get, Patch, Param, UseGuards, Req, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AccessTokenGuard, RolesGuard, Roles, JwtPayload } from '@app/shared';
import { UserService } from './user.service';
import { UpdateUserProfileDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/user.dto';

@ApiTags('Người dùng')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  async getProfile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.userService.getProfile(user.sub);
  }

  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserProfileDto) {
    const user = req.user as JwtPayload;
    return this.userService.updateProfile(user.sub, dto);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Admin)' })
  async findAll(@Req() req: Request) {
    return this.userService.findAll(req.query);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết người dùng (Admin)' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id/role')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thay đổi vai trò người dùng (Admin)' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRole(id, dto.role);
  }

  @Patch(':id/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thay đổi trạng thái người dùng (Admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.userService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa người dùng (Admin)' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
