import { Module } from '@nestjs/common';
import { CategoryServiceController } from './category-service.controller';
import { CategoryServiceService } from './category-service.service';

@Module({
  imports: [],
  controllers: [CategoryServiceController],
  providers: [CategoryServiceService],
})
export class CategoryServiceModule {}
