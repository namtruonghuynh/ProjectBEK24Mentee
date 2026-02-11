import { Module } from '@nestjs/common';
import { StatisticsServiceController } from './statistics-service.controller';
import { StatisticsServiceService } from './statistics-service.service';

@Module({
  imports: [],
  controllers: [StatisticsServiceController],
  providers: [StatisticsServiceService],
})
export class StatisticsServiceModule {}
