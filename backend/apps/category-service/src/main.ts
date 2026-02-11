import { NestFactory } from '@nestjs/core';
import { CategoryServiceModule } from './category-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CategoryServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
