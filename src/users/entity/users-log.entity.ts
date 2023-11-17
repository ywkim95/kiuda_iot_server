import { BaseModel } from 'src/common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from './users.entity';
import { UpdatesEnum } from '../const/updates.const';

@Entity()
export class UsersLogModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.logs)
  user: UsersModel;

  @Column({ comment: '변경한 사용자 IP' })
  ip: string;

  @Column({ comment: '변경한 사용자 기기정보' })
  device: string;

  @Column({
    enum: Object.values(UpdatesEnum),
    default: UpdatesEnum.INFORMATION,
    comment: '변경 구분(정보/비밀번호/결제)',
  })
  updateTo: UpdatesEnum;
}
