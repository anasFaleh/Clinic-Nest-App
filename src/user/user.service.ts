import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * get
   * @param userId
   * @returns
   */
  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }

  /**
   * delete
   * @param userId
   * @returns
   */
  async deleteUser(userId: string) {
    const user = await this.getUser(userId);
    await this.prisma.user.delete({ where: { id: user.id } });
    console.log('hi');
    return { message: 'User Deleted Successflly' };
  }

  /**
   * update
   * @param userId
   * @param dto
   */
  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.getUser(userId);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...dto,
      },
    });
    return { message: 'User Updated Successfully' };
  }
}
