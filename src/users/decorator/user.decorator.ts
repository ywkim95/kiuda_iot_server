import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { UsersModel } from '../entity/users.entity';
import wlogger from 'src/log/winston-logger.const';

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user as UsersModel;
    // console.log(user);

    if (!user) {
      wlogger.error(
        'User Decorator는 AccessTokenGuard와 함께 사용해야합니다. Request에 user 프로퍼티가 존재하지 않습니다!',
      );
      throw new InternalServerErrorException(
        'User Decorator는 AccessTokenGuard와 함께 사용해야합니다. Request에 user 프로퍼티가 존재하지 않습니다!',
      );
    }
    if (data) {
      return user[data];
    }
    return user;
  },
);
