import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  minPrice?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;
}
