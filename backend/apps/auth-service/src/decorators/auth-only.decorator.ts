import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '@app/shared';

export function AuthOnly() {
    return applyDecorators(
        UseGuards(AccessTokenGuard),
        ApiBearerAuth('access-token'),
        ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token hết hạn' }),
    );
}
