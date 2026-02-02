import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorDto, DoctorsFilterDto, UpdateDoctorDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorService {
    constructor(
        private prisma: PrismaService
    ) { }

    /**
     * 
     * @param userId 
     * @param dto 
     * @returns 
     */
    async create(userId: string, dto: CreateDoctorDto) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId: userId } });
        if (doctor) throw new ConflictException('Doctor is already exists');

        return this.prisma.doctor.create({
            data: {
                ...dto,
                user: {
                    connect: { id: userId }
                }
            }
        })
    }


    /**
     * 
     * @param doctorId 
     * @param dto 
     * @returns 
     */
    async update(doctorId: string, dto: UpdateDoctorDto) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) throw new NotFoundException('Doctor Not Found');

        return this.prisma.doctor.update({
            where: { id: doctorId },
            data: { ...dto }
        })
    }


    /**
     * 
     * @param doctorId 
     */
    async findOne(doctorId: string) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) throw new NotFoundException('Doctor not Found');

        return doctor;
    }


    /**
     * 
     * @param dto 
     * @returns 
     */
    async findAll(dto: DoctorsFilterDto) {
        const { page, limit, specialty } = dto
        const skip = (page - 1) * limit
        const take = limit;
        const where: Prisma.DoctorWhereInput = {}

        if (specialty) where.specialty = { contains: specialty, mode: "insensitive" };

        const [data, total] = await Promise.all([
            this.prisma.doctor.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.doctor.count({ where })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }


    /**
     * 
     * @param dto 
     * @returns 
     */
    async search(dto: DoctorsFilterDto) {
        const { fullname, specialty } = dto

        return this.prisma.doctor.findMany({
            where: {
                OR: [
                    {
                        fullName: {
                            contains: fullname,
                            mode: "insensitive"
                        }
                    },
                    {
                        specialty: {
                            contains: specialty,
                            mode: "insensitive"
                        }
                    }
                ]
            }
        });

    }


     async findByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if(!doctor) throw new NotFoundException('Doctor Not Found');
    return doctor;
  }
}
