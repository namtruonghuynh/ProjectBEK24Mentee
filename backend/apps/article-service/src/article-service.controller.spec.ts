import { Test, TestingModule } from '@nestjs/testing';
import { ArticleServiceController } from './article-service.controller';
import { ArticleServiceService } from './article-service.service';

describe('ArticleServiceController', () => {
  let articleServiceController: ArticleServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArticleServiceController],
      providers: [ArticleServiceService],
    }).compile();

    articleServiceController = app.get<ArticleServiceController>(ArticleServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(articleServiceController.getHello()).toBe('Hello World!');
    });
  });
});
