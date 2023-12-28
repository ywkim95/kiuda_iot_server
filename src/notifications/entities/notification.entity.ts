import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseModel } from '../../common/entity/base.entity';
import { UsersModel } from '../../users/entity/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GatewaysModel } from 'src/gateways/entities/gateway.entity';
import { WarningEnum } from '../const/sentence.const';
import { NotifyTypeEnum } from '../const/notify_type_enum.const';

@Entity()
export class NotificationModel extends BaseModel {
  @Column({ comment: '확인 여부', default: false })
  @IsBoolean()
  checkFlag: boolean;

  @Column({ nullable: true, comment: '확인 날짜' })
  @IsDate()
  @IsOptional()
  checkDate?: Date;

  @Column({ comment: '삭제 여부', default: false })
  @IsBoolean()
  deleteFlag: boolean;

  @Column({ nullable: true, comment: '삭제 날짜' })
  @IsDate()
  @IsOptional()
  deleteDate?: Date;

  @Column()
  @IsString()
  title: string;

  @Column({ comment: '내용' })
  @IsString()
  message: string;

  @Column({ comment: '구분', default: NotifyTypeEnum.INFO })
  @IsEnum(NotifyTypeEnum)
  notiType: NotifyTypeEnum;

  // 발생한 디바이스
  @ManyToOne(() => GatewaysModel)
  gateway: GatewaysModel;

  // 유저 정보
  @ManyToOne(() => UsersModel)
  user: UsersModel;
}
