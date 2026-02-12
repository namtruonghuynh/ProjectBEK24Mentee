import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '@app/shared';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

interface CategoryQuery {
    page?: string;
    limit?: string;
    isActive?: string;
}

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    /**
     * Tạo slug từ tên chuyên mục (hỗ trợ tiếng Việt)
     */
    private generateSlug(name: string): string {
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

    /**
     * Tạo chuyên mục mới
     */
    async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
        const slug = this.generateSlug(dto.name);

        // Kiểm tra slug đã tồn tại chưa
        const existing = await this.categoryModel.findOne({ slug });
        if (existing) {
            throw new ConflictException('Chuyên mục với tên này đã tồn tại');
        }

        let level = 0;

        // Nếu có parentId, kiểm tra chuyên mục cha
        if (dto.parentId) {
            const parent = await this.categoryModel.findById(dto.parentId);
            if (!parent) {
                throw new NotFoundException('Chuyên mục cha không tồn tại');
            }
            if (parent.level >= 1) {
                throw new BadRequestException('Chỉ hỗ trợ tối đa 2 cấp chuyên mục');
            }
            level = 1;
        }

        const category = new this.categoryModel({
            ...dto,
            slug,
            level,
        });

        return category.save();
    }

    /**
     * Lấy danh sách chuyên mục (dạng phẳng)
     */
    async findAll(query: CategoryQuery) {
        const page = parseInt(query.page ?? '1') || 1;
        const limit = parseInt(query.limit ?? '20') || 20;
        const skip = (page - 1) * limit;

        const filter: Record<string, boolean> = {};
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === 'true';
        }

        const [categories, total] = await Promise.all([
            this.categoryModel.find(filter)
                .sort({ order: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.categoryModel.countDocuments(filter).exec(),
        ]);

        return {
            data: categories,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Lấy danh sách chuyên mục dạng cây (cha-con)
     */
    async findTree() {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .lean()
            .exec();

        // Nhóm chuyên mục con theo parentId
        const parentCategories = categories.filter(c => !c.parentId);
        const childCategories = categories.filter(c => c.parentId);

        return parentCategories.map(parent => ({
            ...parent,
            children: childCategories.filter(
                child => child.parentId?.toString() === parent._id.toString(),
            ),
        }));
    }

    /**
     * Lấy chi tiết chuyên mục theo slug
     */
    async findBySlug(slug: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findOne({ slug });
        if (!category) {
            throw new NotFoundException('Chuyên mục không tồn tại');
        }
        return category;
    }

    /**
     * Lấy chi tiết chuyên mục theo ID
     */
    async findById(id: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(id);
        if (!category) {
            throw new NotFoundException('Chuyên mục không tồn tại');
        }
        return category;
    }

    /**
     * Cập nhật chuyên mục
     */
    async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
        const updateData: Record<string, unknown> = { ...dto };

        // Nếu đổi tên, tạo lại slug
        if (dto.name) {
            const newSlug = this.generateSlug(dto.name);
            const existing = await this.categoryModel.findOne({ slug: newSlug, _id: { $ne: id } });
            if (existing) {
                throw new ConflictException('Chuyên mục với tên này đã tồn tại');
            }
            updateData.slug = newSlug;
        }

        // Nếu thay đổi parentId, kiểm tra logic phân cấp
        if (dto.parentId !== undefined) {
            if (dto.parentId === null) {
                updateData.level = 0;
            } else {
                if (dto.parentId === id) {
                    throw new BadRequestException('Chuyên mục không thể là cha của chính nó');
                }
                const parent = await this.categoryModel.findById(dto.parentId);
                if (!parent) {
                    throw new NotFoundException('Chuyên mục cha không tồn tại');
                }
                if (parent.level >= 1) {
                    throw new BadRequestException('Chỉ hỗ trợ tối đa 2 cấp chuyên mục');
                }
                updateData.level = 1;

                // Kiểm tra nếu chuyên mục hiện tại đang có con, không cho thành con của chuyên mục khác
                const hasChildren = await this.categoryModel.exists({ parentId: id });
                if (hasChildren) {
                    throw new BadRequestException('Không thể chuyển chuyên mục có con thành chuyên mục con');
                }
            }
        }

        const category = await this.categoryModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) {
            throw new NotFoundException('Chuyên mục không tồn tại');
        }
        return category;
    }

    /**
     * Xóa chuyên mục
     */
    async delete(id: string) {
        const category = await this.categoryModel.findById(id);
        if (!category) {
            throw new NotFoundException('Chuyên mục không tồn tại');
        }

        // Kiểm tra còn bài viết không
        if (category.articleCount > 0) {
            throw new BadRequestException(
                `Không thể xóa chuyên mục đang có ${category.articleCount} bài viết. Vui lòng chuyển bài viết sang chuyên mục khác trước.`,
            );
        }

        // Kiểm tra còn chuyên mục con không
        const hasChildren = await this.categoryModel.exists({ parentId: id });
        if (hasChildren) {
            throw new BadRequestException('Không thể xóa chuyên mục đang có chuyên mục con');
        }

        await this.categoryModel.findByIdAndDelete(id);
        return { message: 'Xóa chuyên mục thành công' };
    }
}
