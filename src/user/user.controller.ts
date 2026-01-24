import {
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { passwordDto } from './dto';
import { GetUser, Roles } from 'src/common/decorators';
import { JwtGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/common/guards';
import { UserRole } from 'src/common/Enums';
@UseGuards(JwtGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('change-password')
  changePassword(@GetUser() id: string, dto: passwordDto) {
    return this.userService.changePassowrd(id, dto);
  }
  @Roles(UserRole.ADMIN)
  @Patch('active/:id')
  active(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.active(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch('active/:id')
  disActive(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.disActive(id);
  }
}
