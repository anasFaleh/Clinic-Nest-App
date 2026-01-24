import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { passwordDto } from './dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param id
   * @returns
   */
  async findOne(id: string) {
    const user = this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   *
   * @param id
   * @returns
   */
  async disActive(id: string) {
    const user = await this.findOne(id);
    return await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   *
   * @param id
   * @returns
   */
  async active(id: string) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async changePassowrd(id: string, dto: passwordDto) {
    const user = await this.findOne(id);

    const isMatch = await compare(dto.oldPassword, user?.password!);
    if (!isMatch) throw new UnauthorizedException('Old password is incorrect');

    const hashed = await hash(dto.newPassword, 10);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  }
}
