import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const rawToken = req.headers['authorization'];
    const ip = this.usersService.findIp(req);

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateUser(
      {
        email,
        password,
      },
      ip,
    );

    req.user = user;

    return true;
  }
}
