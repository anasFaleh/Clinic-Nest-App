import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class UpdateAppintmentDto {
    
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startTime: Date
}