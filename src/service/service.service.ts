import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceService {
    constructor(
        private prisma: PrismaService
    ) { }

    async findOne(serviceId: string) {
        const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
        if(!service) throw new NotFoundException('Servise not Found');
        return service;
    }
}
