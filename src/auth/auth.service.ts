import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { PayloadInterface } from './payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) throw new ConflictException('User Is Already Exsists');

    const hashed = await hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: hashed,
        name: dto.name,
        cart: {
          create: {},
        },
      },
    });

    const tokens = await this.getTokens({
      sub: newUser.id,
      role: newUser.role,
    });
    await this.updateRT(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.getTokens({ sub: user.id, role: user.role });
    await this.updateRT(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { RT: null },
    });
    return { message: 'Loged Out Successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !refreshToken || !user.RT) {
      throw new UnauthorizedException('Access Denied');
    }

    const isMatch = await compare(refreshToken, user.RT);
    if (!isMatch) throw new UnauthorizedException('Invalid Refresh Token');

    const tokens = await this.getTokens({ sub: user.id, role: user.role });

    await this.updateRT(userId, tokens.refreshToken);

    return tokens;
  }

  // Helpers

  async getTokens(payload: PayloadInterface) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async updateRT(userId: string, rt: string) {
    const hashed = await hash(rt, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        RT: hashed,
      },
    });
  }

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User Not Found');

    const isMatch = await compare(dto.password, user.hash);
    if (!isMatch) throw new UnauthorizedException('Password is Incorrect');

    return user;
  }
}
