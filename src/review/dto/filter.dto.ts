import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsUUID } from 'class-validator';

export class FilterQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  maxRating?: number;

  @IsOptional()
  @IsUUID()
  userId?: string;
  @IsOptional()
  @IsUUID()
  productId?: string;
}
