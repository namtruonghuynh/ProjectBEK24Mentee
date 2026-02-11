import { Controller, Get } from '@nestjs/common';
import { ArticleServiceService } from './article-service.service';

@Controller()
export class ArticleServiceController {
  constructor(private readonly articleServiceService: ArticleServiceService) {}

  @Get()
  getHello(): string {
    return this.articleServiceService.getHello();
  }
}
