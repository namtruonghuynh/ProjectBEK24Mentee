import { NestFactory } from '@nestjs/core';
import { ArticleServiceModule } from './article-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ArticleServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
