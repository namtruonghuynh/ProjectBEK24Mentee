import { Module } from '@nestjs/common';
import { ArticleServiceController } from './article-service.controller';
import { ArticleServiceService } from './article-service.service';

@Module({
  imports: [],
  controllers: [ArticleServiceController],
  providers: [ArticleServiceService],
})
export class ArticleServiceModule {}
