import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewaysModel } from './entities/gateway.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { GatewaysLogModel } from './entities/gateway-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GatewaysModel, GatewaysLogModel]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  exports: [GatewaysService],
  controllers: [GatewaysController],
  providers: [GatewaysService],
})
export class GatewaysModule {}
