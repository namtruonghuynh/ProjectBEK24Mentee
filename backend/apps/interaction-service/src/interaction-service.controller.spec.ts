import { Test, TestingModule } from '@nestjs/testing';
import { InteractionServiceController } from './interaction-service.controller';
import { InteractionServiceService } from './interaction-service.service';

describe('InteractionServiceController', () => {
  let interactionServiceController: InteractionServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InteractionServiceController],
      providers: [InteractionServiceService],
    }).compile();

    interactionServiceController = app.get<InteractionServiceController>(InteractionServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(interactionServiceController.getHello()).toBe('Hello World!');
    });
  });
});
