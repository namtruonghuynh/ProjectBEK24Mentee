import { Controller, Get } from '@nestjs/common';
import { CategoryServiceService } from './category-service.service';

@Controller()
export class CategoryServiceController {
  constructor(private readonly categoryServiceService: CategoryServiceService) {}

  @Get()
  getHello(): string {
    return this.categoryServiceService.getHello();
  }
}
