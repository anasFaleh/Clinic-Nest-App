import { Type } from "class-transformer"
import { IsDate, isDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"


export class CreateAppointmentDto {

    @IsNotEmpty()
    @IsUUID()
    doctorId: string

    @IsNotEmpty()
    @IsUUID()
    serviceId: string


    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startTime: Date

}