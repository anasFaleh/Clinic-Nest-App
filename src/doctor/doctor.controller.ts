import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, DoctorsFilterDto, UpdateDoctorDto } from './dto';
import { GetUser } from 'src/common/decorators';

@Controller('doctor')
export class DoctorController {
    constructor(
        private doctorService: DoctorService
    ) { }

    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateDoctorDto) {
        return this.doctorService.create(userId, dto)
    }

    @Patch(':id')
    update(@Param('id') doctorId: string, @Body() dto: UpdateDoctorDto){
        return this.doctorService.update(doctorId, dto)
    }

    @Get()
    findAll(@Query() dto: DoctorsFilterDto){
        return this.doctorService.findAll(dto)
    }

    @Get('search')
    search(@Query() dto: DoctorsFilterDto){
        return this.doctorService.search(dto)
    }

    @Get(':id')
    findOne(@Param('id') doctorId: string){
        return this.doctorService.findOne(doctorId)
    }

   
}
