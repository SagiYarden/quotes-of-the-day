import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RandomQuotesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count = 10;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  // I don't want to allow more than 50 so that the API doesn't get overloaded
  // and to prevent the client from requesting too many quotes at once (like 1 mill page size...).
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50, { message: 'pageSize cannot exceed 50' })
  @IsOptional()
  pageSize?: number = 25;
}
