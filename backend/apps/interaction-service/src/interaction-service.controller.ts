import { Controller, Get } from '@nestjs/common';
import { InteractionServiceService } from './interaction-service.service';

@Controller()
export class InteractionServiceController {
  constructor(private readonly interactionServiceService: InteractionServiceService) {}

  @Get()
  getHello(): string {
    return this.interactionServiceService.getHello();
  }
}
