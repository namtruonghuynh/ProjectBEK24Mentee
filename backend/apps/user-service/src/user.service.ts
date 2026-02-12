import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@app/shared';
import { UpdateUserProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -refreshTokenHash');
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true }
    ).select('-password -refreshTokenHash');

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find()
        .select('-password -refreshTokenHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -refreshTokenHash');
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async updateRole(userId: string, role: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password -refreshTokenHash');

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async updateStatus(userId: string, status: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password -refreshTokenHash');

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return { message: 'Xóa người dùng thành công' };
  }
}
