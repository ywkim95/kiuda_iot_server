import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 1. 알람 등록
   * 2. 알람 조회(조회시 확인 플래그 처리)
   *
   */
  @Post()
  postNotification() {}

  @Get(':userId')
  getNotification(@Param('userId') userId: number) {}
}
