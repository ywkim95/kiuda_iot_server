import { UsersModel } from '../../users/entity/users.entity';
import { BaseWithUpdateModel } from '../../common/entity/base-with-update.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class FirebaseModel extends BaseWithUpdateModel {
  @ManyToOne(() => UsersModel)
  @JoinColumn()
  user: UsersModel;

  @Column({ comment: '토큰 값' })
  @IsString()
  token: string;

  @Column({ comment: '기기정보' })
  @IsString()
  clientInfo: string;
}
