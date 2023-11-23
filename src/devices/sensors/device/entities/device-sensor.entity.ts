import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { SensorSpecificationsModel } from '../../specifications/entities/specifications-sensor.entity';
/**
 * 1. 센서
 *  1) 제원
 *  2) 실시간 데이터
 *  3) 누적 데이터
 *    (1) 기본 누적 데이터
 *    (2) 일사량 누적 데이터
 *  4) 로그 <- 센서 정보 변경 기록
 */
/**
 * 센서별 매핑관계
 * 디바이스에 연결된 센서 정보
 *
 */
@Entity()
export class DeviceSensorsModel extends BaseWithUpdateModel {
  // 이거 게이트웨이가 아니라 디바이스로 가야됨
  @ManyToOne(() => DevicesModel, (device) => device.sensors)
  device: DevicesModel;

  // 매핑된 센서번호 이거그냥 제원이랑 매핑시키면 될듯
  @ManyToOne(() => SensorSpecificationsModel)
  spec: SensorSpecificationsModel;

  @Column({ comment: '보정 값' })
  @IsNumber()
  correctionValue: number;

  @Column({ comment: '장비 명' })
  @IsString()
  name: string;

  @Column({ comment: '범위 시작' })
  @IsNumber()
  customStableStart: number;

  @Column({ comment: '범위 끝' })
  @IsNumber()
  customStableEnd: number;
  // 실시간데이터도 추가해야되는데 굳이...? 실시간데이터쪽에 ManyToOne만 해줘도될듯
}
/**
 * 1. 소켓io로 통신시 개인별로 룸아이디리스트로 나누어 접속한다.
 * 2. roomid는 게이트웨이 아이디나 countryId+areaId+gatewayId를 더한것으로 한다.
 * 후자가 좋아보임
 * 3. 접속한 뒤에는 필요한 정보(실시간 센서정보, 제어기 정보)를 구독한다.
 * 4. 갱신은 로직 하나를 만들어 실시간 센서,제어기정보를 받는 서비스 로직에서 업데이트된 최종 정보를 가져온다.
 */
