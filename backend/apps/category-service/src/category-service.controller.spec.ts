import { Test, TestingModule } from '@nestjs/testing';
import { CategoryServiceController } from './category-service.controller';
import { CategoryServiceService } from './category-service.service';

describe('CategoryServiceController', () => {
  let categoryServiceController: CategoryServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CategoryServiceController],
      providers: [CategoryServiceService],
    }).compile();

    categoryServiceController = app.get<CategoryServiceController>(CategoryServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(categoryServiceController.getHello()).toBe('Hello World!');
    });
  });
});
