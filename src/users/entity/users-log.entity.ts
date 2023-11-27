import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from './users.entity';
import { UpdatesEnum } from '../const/updates.const';
import { IsString } from 'class-validator';
import { BaseModel } from '../../common/entity/base.entity';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';

@Entity()
export class UsersLogModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.logs)
  user: UsersModel;

  @Column({ comment: '변경한 사용자 IP' })
  @IsString({
    message: stringValidationMessage,
  })
  ip: string;

  @Column({ comment: '변경한 사용자 기기정보' })
  @IsString({
    message: stringValidationMessage,
  })
  device: string;

  @Column({
    enum: Object.values(UpdatesEnum),
    default: UpdatesEnum.INFORMATION,
    comment: '변경 구분(정보/비밀번호/결제)',
  })
  updateTo: UpdatesEnum;
}
