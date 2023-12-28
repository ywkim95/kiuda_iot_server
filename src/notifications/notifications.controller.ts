import { Controller, Get, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsPaginationDto } from './dto/paginate-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 1. 알람 등록
   * 2. 알람 조회(조회시 확인 플래그 처리)
   *
   */

  @Get(':roomId')
  // admin or me
  async getNotification(
    @Param('roomId') roomId: string,
    @Query() query: NotificationsPaginationDto,
  ) {
    return await this.notificationsService.paginateNotifications(query, roomId);
  }
}
