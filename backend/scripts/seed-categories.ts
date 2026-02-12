import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategorySchema } from '@app/shared';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/auth-db'),
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ],
})
class SeedModule { }

// Dữ liệu chuyên mục mẫu cho báo điện tử
const parentCategories = [
    { name: 'Thời sự', description: 'Tin tức thời sự trong nước', order: 1 },
    { name: 'Thế giới', description: 'Tin tức quốc tế', order: 2 },
    { name: 'Kinh doanh', description: 'Tin tức kinh tế, tài chính', order: 3 },
    { name: 'Công nghệ', description: 'Tin tức công nghệ, khoa học', order: 4 },
    { name: 'Giáo dục', description: 'Tin tức giáo dục, đào tạo', order: 5 },
    { name: 'Thể thao', description: 'Tin tức thể thao', order: 6 },
    { name: 'Giải trí', description: 'Tin tức giải trí, showbiz', order: 7 },
    { name: 'Sức khỏe', description: 'Tin tức sức khỏe, y tế', order: 8 },
];

// Chuyên mục con (key = tên cha)
const childCategories: Record<string, { name: string; description: string; order: number }[]> = {
    'Thời sự': [
        { name: 'Chính trị', description: 'Tin chính trị trong nước', order: 1 },
        { name: 'Pháp luật', description: 'Tin pháp luật, an ninh', order: 2 },
    ],
    'Thế giới': [
        { name: 'Châu Á', description: 'Tin tức khu vực Châu Á', order: 1 },
        { name: 'Châu Âu', description: 'Tin tức khu vực Châu Âu', order: 2 },
    ],
    'Kinh doanh': [
        { name: 'Chứng khoán', description: 'Tin chứng khoán, đầu tư', order: 1 },
        { name: 'Bất động sản', description: 'Tin bất động sản', order: 2 },
    ],
    'Công nghệ': [
        { name: 'AI & Machine Learning', description: 'Trí tuệ nhân tạo', order: 1 },
        { name: 'Điện thoại', description: 'Tin tức điện thoại, tablet', order: 2 },
    ],
    'Thể thao': [
        { name: 'Bóng đá', description: 'Tin bóng đá trong nước và quốc tế', order: 1 },
        { name: 'Esports', description: 'Tin tức thể thao điện tử', order: 2 },
    ],
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeedModule);
    const categoryModel = appContext.get<Model<Category>>(getModelToken(Category.name));

    // Tạo chuyên mục cha
    for (const cat of parentCategories) {
        const slug = generateSlug(cat.name);
        let parent = await categoryModel.findOne({ slug });

        if (!parent) {
            parent = new categoryModel({
                name: cat.name,
                slug,
                description: cat.description,
                order: cat.order,
                level: 0,
                parentId: null,
            });
            await parent.save();
            console.log(`✅ Tạo chuyên mục cha: ${cat.name} (/${slug})`);
        } else {
            console.log(`⏭️  Đã tồn tại: ${cat.name}`);
        }

        // Tạo chuyên mục con (nếu có)
        const children = childCategories[cat.name];
        if (children) {
            for (const child of children) {
                const childSlug = generateSlug(child.name);
                const existingChild = await categoryModel.findOne({ slug: childSlug });

                if (!existingChild) {
                    const childDoc = new categoryModel({
                        name: child.name,
                        slug: childSlug,
                        description: child.description,
                        order: child.order,
                        level: 1,
                        parentId: parent._id,
                    });
                    await childDoc.save();
                    console.log(`  └── ✅ Tạo chuyên mục con: ${child.name} (/${childSlug})`);
                } else {
                    console.log(`  └── ⏭️  Đã tồn tại: ${child.name}`);
                }
            }
        }
    }

    await appContext.close();
    console.log('\n🎉 Seed categories hoàn tất!');
}

bootstrap();
