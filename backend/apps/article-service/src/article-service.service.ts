import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
