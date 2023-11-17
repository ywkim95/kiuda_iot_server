import { GatewaysModel } from './gateway.entity';
import { Column, ManyToOne } from 'typeorm';
import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';

export class GatewaysGeneralLogModel extends BaseModel {
  @ManyToOne(() => GatewaysModel)
  @Column({ comment: '변경한 게이트웨이 ID' })
  gateway: GatewaysModel;

  @Column({ nullable: true, comment: '변경 전 위치' })
  @IsString()
  oldLocation?: string;

  @Column({ nullable: true, comment: '변경 전 이름' })
  @IsString()
  oldName?: string;

  @Column({ nullable: true, comment: '변경 전 설명' })
  @IsString()
  oldDescription?: string;

  @Column({ nullable: true, comment: '변경 전 제어 스크립트' })
  @IsString()
  oldControlScript?: string;
}
