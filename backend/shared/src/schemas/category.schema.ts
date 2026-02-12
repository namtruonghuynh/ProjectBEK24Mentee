import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, trim: true, maxlength: 100 })
    name!: string;

    @Prop({ required: true, unique: true, trim: true })
    slug!: string;

    @Prop({ default: '' })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parentId?: Types.ObjectId | null;

    @Prop({ type: Number, default: 0, enum: [0, 1] })
    level!: number;

    @Prop({ type: Number, default: 0 })
    order!: number;

    @Prop({ type: Number, default: 0 })
    articleCount!: number;

    @Prop({ type: Boolean, default: true })
    isActive!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
