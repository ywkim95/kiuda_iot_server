import { BaseModel } from 'src/common/entity/base.entity';
import { Entity } from 'typeorm';
/**
 * 1. 센서
 *  1) 제원
 *  2) 실시간 데이터
 *  3) 누적 데이터
 *    (1) 기본 누적 데이터
 *    (2) 일사량 누적 데이터
 *  4) 로그 <- 센서 정보 변경 기록
 */
@Entity()
export class BaseSensorModel extends BaseModel {}
