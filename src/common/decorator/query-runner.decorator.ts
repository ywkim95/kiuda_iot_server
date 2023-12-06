import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import wlogger from 'src/log/winston-logger.const';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      wlogger.error(
        `QueryRunner Decorator를 사용하려면 TransactionIntercepter를 적용해야 합니다.`,
      );
      throw new InternalServerErrorException(
        `QueryRunner Decorator를 사용하려면 TransactionIntercepter를 적용해야 합니다.`,
      );
    }

    return req.queryRunner;
  },
);
