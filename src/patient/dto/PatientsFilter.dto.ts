import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PatientFilterDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  minAge: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAge: number;
}
