import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseWithUpdateModel } from '../../common/entity/base-with-update.entity';
import { UsersModel } from '../../users/entity/users.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DevicesModel } from '../../devices/entities/device.entity';

function formatStringAsThreeDigit(value: string): string {
  return value.padStart(3, '0');
}

@Entity()
export class GatewaysModel extends BaseWithUpdateModel {
  @ManyToOne(() => UsersModel, (user) => user.gateways)
  owner: UsersModel;
  // where__onwer_email__i_like
  // where / onwer_email / i_like
  // onwer_email -> onwer: { email: }
  // const field_list = fields.split('_');
  // if(field_list.length === 1) a~~~~
  // else b~~~~

  @Column()
  @IsString()
  countryId: string;

  @Column()
  @IsString()
  areaId: string;

  @Column()
  @IsString()
  gatewayId: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column()
  @IsNumber()
  frequency: number;

  @Column()
  @IsNumber()
  txPower: number;

  @Column()
  @IsNumber()
  rfConfig: number;

  @Column({
    default: 1,
  })
  @IsNumber()
  gatewayIdInc: number;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  controlScript?: string;

  @Column()
  @IsString()
  ssid: string;

  @Column()
  @IsString()
  ssidPassword: string;

  @Column({
    default: false,
  })
  @IsBoolean()
  resetYn: boolean;

  @Column({
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  lastPkUpdateDate?: Date;

  @Column({
    default: true,
  })
  @IsBoolean()
  useYn: boolean;

  @OneToMany(() => DevicesModel, (device) => device.gateway)
  devices: DevicesModel[];

  @BeforeInsert()
  @BeforeUpdate()
  formatFields() {
    this.countryId = formatStringAsThreeDigit(this.countryId);
    this.areaId = formatStringAsThreeDigit(this.areaId);
    this.gatewayId = formatStringAsThreeDigit(this.gatewayId);
  }
}
