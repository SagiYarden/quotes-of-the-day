import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesListDto } from './random-quotes.dto';

@Controller('quotes')
export class AppController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('list')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getQuotes(@Query() dto: QuotesListDto) {
    return this.quotesService.getQuotes(
      dto.count,
      dto.page,
      dto.pageSize,
      dto.tag
    );
  }
}
