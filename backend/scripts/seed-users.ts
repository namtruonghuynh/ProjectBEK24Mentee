import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserSchema } from '@app/shared';
import * as bcrypt from 'bcryptjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/auth-db'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
class SeedModule { }

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeedModule);
    const userModel = appContext.get<Model<User>>(getModelToken(User.name));

    const roles = ['admin', 'editor', 'reporter', 'member'];
    const password = 'password123';
    for (const role of roles) {
        const email = `${role}@example.com`;
        let user = await userModel.findOne({ email });

        if (!user) {
            user = new userModel({
                email,
                password: password, // Pass plain password, pre-save hook will hash it
                fullName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
                role,
                status: 'active',
            });
            await user.save();
            console.log(`Created user: ${email} (${role})`);
        } else {
            user.password = password; // Reset password to plain text
            await user.save(); // save() triggers the pre-save hook to hash it
            console.log(`Updated user password: ${email} (${role})`);
        }
    }

    await appContext.close();
    console.log('Seeding complete.');
}

bootstrap();
