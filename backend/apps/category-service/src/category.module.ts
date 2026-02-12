import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema, AccessTokenStrategy, AccessTokenGuard, RolesGuard } from '@app/shared';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ],
    controllers: [CategoryController],
    providers: [
        CategoryService,
        AccessTokenStrategy,
        AccessTokenGuard,
        RolesGuard,
    ],
})
export class CategoryModule { }
