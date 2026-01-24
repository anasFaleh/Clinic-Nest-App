import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString, MaxDate } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @Type(() => Date)
  @MaxDate(new Date)
  @IsDate()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  address: string;
}
