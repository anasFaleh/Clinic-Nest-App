import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/common/guards';
import { GetUser, Roles } from 'src/common/decorators';
import { UserRole } from 'src/common/Enums';
import { CreatePatientDto, PatientFilterDto } from './dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}
  @Post()
  create(@Body() dto: CreatePatientDto, @GetUser('id') userId: string) {
    return this.patientService.create(dto, userId);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: PatientFilterDto) {
    return this.patientService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientService.update(id, dto);
  }
}
