import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsServiceController } from './statistics-service.controller';
import { StatisticsServiceService } from './statistics-service.service';

describe('StatisticsServiceController', () => {
  let statisticsServiceController: StatisticsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsServiceController],
      providers: [StatisticsServiceService],
    }).compile();

    statisticsServiceController = app.get<StatisticsServiceController>(StatisticsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(statisticsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
