import { Injectable } from '@nestjs/common';

@Injectable()
export class InteractionServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
