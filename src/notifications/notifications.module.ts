import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModel } from './entities/notification.entity';
import { FirebaseModel } from '../firebase-admin/entities/firebase.entity';
import { FirebaseAdminModule } from 'src/firebase-admin/firebase-admin.module';
import { DevicesModule } from 'src/devices/devices.module';
import { GatewaysModule } from 'src/gateways/gateways.module';

@Module({
  imports: [
    CommonModule,
    FirebaseAdminModule,
    GatewaysModule,
    TypeOrmModule.forFeature([NotificationModel]),
  ],
  exports: [NotificationsService],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
