import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
