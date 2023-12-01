import { PickType } from '@nestjs/mapped-types';
import { NotificationModel } from '../entities/notification.entity';

export class CreateNotificationDto extends PickType(NotificationModel, [
  'device',
  'user',
  'message',
  'title',
]) {}
