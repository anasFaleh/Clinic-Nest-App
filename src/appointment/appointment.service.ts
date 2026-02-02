import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppintmentDto } from './dto';
import { ServiceService } from 'src/service/service.service';
import { PatientService } from 'src/patient/patient.service';
import { DoctorService } from 'src/doctor/doctor.service';
import { AppointmentStatus, UserRole } from 'src/common/Enums';

@Injectable()
export class AppointmentService {
    constructor(
        private prisma: PrismaService,
        private serviceService: ServiceService,
        private patientService: PatientService,
        private doctorService: DoctorService
    ) { }

    /**
     * 
     * @param dto 
     * @param userId 
     * @returns 
     */
    async create(dto: CreateAppointmentDto, userId: string) {
        const [patient, doctor, service] = await Promise.all([
            this.patientService.findByUserId(userId),
            this.doctorService.findOne(dto.doctorId),
            this.serviceService.findOne(dto.serviceId)
        ]);


        if (service.doctorId !== doctor.id) throw new ConflictException('This servcie is not belong to this doctor');
        const endTime = await this.calculateEndTime(dto.startTime, service.durationMin);

        await Promise.all([
            this.doctorAvailable(doctor.id, dto.startTime, endTime),
            this.patientAvailable(patient.id, dto.startTime, endTime)
        ]);

        return this.prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                startTime: dto.startTime,
                endTime: endTime,
                duration: service.durationMin
            }
        })

    }



    /**
     * 
     * @param dto 
     * @param userId 
     * @param appointmentId 
     * @returns 
     */
    async update(dto: UpdateAppintmentDto, userId: string, appointmentId: string) {

        const [appointment, patient] = await Promise.all([

            this.findOne(appointmentId),
            this.patientService.findByUserId(userId)
        ]);
        if (appointment.patientId !== patient.id) throw new ForbiddenException('This appointment is not belong to this patient');
        if (appointment.status !== AppointmentStatus.SCHEDULED) throw new ConflictException('The appointment canceled or completed');

        const endTime = await this.calculateEndTime(dto.startTime, appointment.duration);

        await Promise.all([
            this.doctorAvailable(appointment.doctorId, dto.startTime, endTime),
            this.patientAvailable(patient.id, dto.startTime, endTime)
        ]);


        return this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { ...dto }
        });
    }


    /**                                     
     * 
     * @param appointmentId 
     * @returns 
     */
    async findOne(appointmentId: string) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) throw new NotFoundException('Appointment Not Found');
        return appointment;
    }


    /**
     * 
     * @param appointmentId 
     * @param userId 
     * @param role 
     * @returns 
     */
    async cancelAppointment(appointmentId: string, userId: string, role: UserRole) {

        const appointment = await this.findOne(appointmentId);
        if (appointment.status !== AppointmentStatus.SCHEDULED) throw new ConflictException('The appointment is completed or aleardy canceled');

        if (role === UserRole.DOCTOR) {
            const doctor = await this.doctorService.findByUserId(userId);

            if (appointment.doctorId !== doctor.id) throw new ForbiddenException('The currnet doctor does not own this appointment');

            return this.prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: AppointmentStatus.CANCELLED }
            });
        }

        const patient = await this.patientService.findByUserId(userId);
        if (appointment.patientId !== patient.id) throw new ForbiddenException('The currnet patient does not own this appointment');

        return this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: AppointmentStatus.CANCELLED }
        });
    }


    /**
     * 
     * @param appointmentId 
     * @param userId 
     * @returns 
     */
    async complete(appointmentId: string, userId: string){
        const appointment = await this.findOne(appointmentId);

        if(appointment.status !== AppointmentStatus.SCHEDULED) throw new ConflictException('The appointment is completed or aleardy canceled');

        const doctor = await this.doctorService.findByUserId(userId);
        if(appointment.doctorId !== doctor.id) throw new ForbiddenException('doctor does not own this appintment');

        if(new Date() < appointment.startTime) throw new ConflictException('Appointment has not started yet');

        return this.prisma.appointment.update({
            where:{id:appointmentId},
            data: {status: AppointmentStatus.COMPLETED}
        });
    }



    // Helpers


    private async calculateEndTime(start: Date, durationMin: number): Promise<Date> {
        return new Date(start.getTime() + durationMin * 60 * 1000)
    }

    private async doctorAvailable(doctotId: string, start: Date, end: Date) {
        const overlap = await this.prisma.appointment.findFirst({
            where: {
                doctorId: doctotId,
                startTime: { lt: end },
                endTime: { gt: start },
                status: AppointmentStatus.SCHEDULED
            }
        });
        if (overlap) throw new ConflictException('Doctor is not available at this time');
    }


    private async patientAvailable(patientId: string, start: Date, end: Date) {
        const overlap = await this.prisma.appointment.findFirst({
            where: {
                patientId: patientId,
                startTime: { lt: end },
                endTime: { gt: start },
                status: AppointmentStatus.SCHEDULED
            }
        });
        if (overlap) throw new ConflictException('Patient already has an appointment at this time');

    }
}

