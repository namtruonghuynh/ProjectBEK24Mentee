import { NestFactory } from '@nestjs/core';
import { InteractionServiceModule } from './interaction-service.module';

async function bootstrap() {
  const app = await NestFactory.create(InteractionServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
