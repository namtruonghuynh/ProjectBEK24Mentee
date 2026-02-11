import { Module } from '@nestjs/common';
import { InteractionServiceController } from './interaction-service.controller';
import { InteractionServiceService } from './interaction-service.service';

@Module({
  imports: [],
  controllers: [InteractionServiceController],
  providers: [InteractionServiceService],
})
export class InteractionServiceModule {}
