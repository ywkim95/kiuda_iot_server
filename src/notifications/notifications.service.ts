import { Injectable } from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationModel } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationsPaginationDto } from './dto/paginate-notification.dto';
import { UsersModel } from '../users/entity/users.entity';
import { FirebaseNotificationService } from '../firebase-admin/firebase-notification.service';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { GatewaysService } from 'src/gateways/gateways.service';
import { GatewaysModel } from 'src/gateways/entities/gateway.entity';

@Injectable()
export class NotificationsService {
  /**
   * 1. 알림 생성
   * 어떤 센서가 기준 값을 넘겼는지 확인하는용도인데...
   * realtimedata을 받았을때 검증 로직을 한번 거치고 넘겼다면 알림에 대한 내용을 db에 저장한다.
   *
   * 2. 알림 전송
   * 마지막으로 저장된 알림을 해당 유저에게 보낸다.
   *
   * 3. 알림 페이지네이션
   * 말그대로 페이지네이션 기능
   *
   * 4. 확인 플래그
   * 유저가 알림을 확인하면 체크했다는 의미로 플래그를 true로 변환 (확인을 안한경우 false)
   *
   * 5. (별도) 삭제 플래그
   * 유저가 알림을 삭제하면 실제로 내용이 삭제되는것이 아닌 삭제플래그가 true로 변환 (default는 false)
   */
  constructor(
    @InjectRepository(NotificationModel)
    private readonly notiRepository: Repository<NotificationModel>,
    private readonly firebaseNotiService: FirebaseNotificationService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly gatewayService: GatewaysService,
    private readonly commonService: CommonService,
  ) {}

  async registerNotification(
    title: string,
    message: string,
    user: UsersModel,
    gateway: GatewaysModel,
  ) {
    /**
     * 시나리오 : 현재상황은 값을 넘긴걸 확인 후 데이터가 넘어온 상태
     * 확인하는 로직을 통하여 들어온 값들이 어떤 기준 값을 벗어났는지 같이 넘어옴.
     * 그러면 확인하는 로직에서 map으로 값과 넘긴 수치들을 정리해서 넘겨주는게 맞다.
     *
     */
    const noti = new NotificationModel();
    noti.gateway = gateway;
    noti.user = user;
    noti.title = title ?? '';
    noti.message = message ?? ''; // 여기에 내용을 채워야한다.

    const save = await this.saveNoti(noti);
    console.log(save);

    const notify = await this.notiRepository.findOne({
      where: {
        user: { id: user.id },
      },
      relations: {
        user: true,
      },
    });
    console.log(notify);
    await this.sendNotification(notify);
  }

  // title은 어떤 범위인지 low, high, warning 정도로 나뉘겠지
  // 바디는 이제 ${deviceName}의 값이 ${초과/미만에 대한 값}을 상태입니다. 확인바랍니다.
  // 이렇게 지어주면 좋을거같은데

  async sendNotification(noti: NotificationModel) {
    const firebaseList = await this.firebaseAdminService.getTokenList(
      noti.user,
    );

    firebaseList.forEach(async (firebase) => {
      await this.firebaseNotiService.sendPushNotification(
        firebase.token,
        noti.title,
        noti.message,
      );
    });
  }

  async paginateNotifications(dto: NotificationsPaginationDto, roomId: string) {
    const gateway = await this.gatewayService.getGatewayFromRoomId(roomId);

    const list = await this.commonService.paginate(
      dto,
      this.notiRepository,
      {
        where: {
          gateway: {
            id: gateway.id,
          },
        },
      },
      `notifications/${roomId}`,
    );

    list.data
      .map((noti) => this.checkFlag(noti))
      .map(async (noti) => await this.saveNoti(noti));

    return list;
  }

  checkFlag(noti: NotificationModel) {
    const newNoti: NotificationModel = {
      ...noti,
      checkFlag: true,
      checkDate: new Date(),
    };
    return newNoti;
  }

  async saveNoti(noti: NotificationModel) {
    return await this.notiRepository.save(noti);
  }

  async deleteNotifications(notiList: NotificationModel[]) {
    const list = notiList.map((noti) => {
      noti.deleteFlag = true;
      noti.deleteDate = new Date();
      return noti;
    });
    await Promise.all(list.map(async (noti) => await this.saveNoti(noti)));

    return true;
  }
}
