import { Controller, Get } from '@nestjs/common';
import { StatisticsServiceService } from './statistics-service.service';

@Controller()
export class StatisticsServiceController {
  constructor(private readonly statisticsServiceService: StatisticsServiceService) {}

  @Get()
  getHello(): string {
    return this.statisticsServiceService.getHello();
  }
}
