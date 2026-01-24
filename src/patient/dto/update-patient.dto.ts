import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './crate-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}