import { Global, Module } from '@nestjs/common';
import { PaginationsService } from './paginations.service';

@Global()
@Module({
  providers: [PaginationsService],
  exports: [PaginationsService],
})
export class PaginationsModule {}
