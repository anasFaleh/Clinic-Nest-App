import { PartialType } from "@nestjs/swagger";
import { CreateDoctorDto } from "./createDoctor.dot";

export class UpdateDoctorDto extends PartialType(CreateDoctorDto){}