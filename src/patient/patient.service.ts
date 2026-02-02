import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientDto, PatientFilterDto, UpdatePatientDto } from './dto';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';
import { skip } from 'node:test';

@Injectable()
export class PatientService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) { }

  /**
   *
   * @param dto
   * @param userId
   * @returns
   */
  async create(dto: CreatePatientDto, userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: userId },
    });
    if (patient) throw new ConflictException('Patient is already exists');

    return this.prisma.patient.create({
      data: {
        ...dto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   *
   * @param id
   * @param dto
   * @returns
   */
  async update(patientId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.patient.update({
      where: { id: patientId },
      data: { ...dto },
    });
  }

  /**
   *
   * @returns
   */
  async findAll(dto: PatientFilterDto) {
    const { minAge, maxAge, page, limit } = dto;
    const skip = (page - 1) * limit;
    const where: Prisma.PatientWhereInput = {};

    if (minAge || maxAge) {
      where.dateOfBirth = {};
      if (minAge) where.dateOfBirth.lte = await this.dobFromAge(minAge);
      if (maxAge) where.dateOfBirth.gte = await this.dobFromAge(maxAge);
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    return patient;
  }

  // Helpter functions:

  async dobFromAge(age: number): Promise<Date> {
    const date = new Date();
    date.setFullYear(date.getFullYear() - age);
    return date;
  }


  async findByUserId(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if(!patient) throw new NotFoundException('Patient Not Found');
    return patient;
  }
}
