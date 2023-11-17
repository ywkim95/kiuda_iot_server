import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PermissionsEnum } from '../const/permission.const';
import { IsEmail, IsString, Length } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { IsCustomPhoneNumber } from 'src/common/decorator/is-custom-phone-number.decorator';
import { UsersLogModel } from './users-log.entity';
import { Exclude } from 'class-transformer';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { IsPassword } from '../decorator/is-password.decorator';
import { GatewaysModel } from 'src/gateways/entities/gateway.entity';

/**
 * id
 * email
 * password
 * name
 * address
 * phoneNumber
 * lastLoginDate
 * lastLoginIp
 * roles
 * permission
 * createdAt
 * createdBy
 * updatedAt
 * updatedBy
 */
@Entity()
export class UsersModel extends BaseWithUpdateModel {
  @Column({
    unique: true,
    comment: '이메일',
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column({ comment: '비밀번호' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsPassword()
  @Length(6, 20, { message: lengthValidationMessage })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({ comment: '사용자명' })
  @IsString({
    message: stringValidationMessage,
  })
  name: string;

  @Column({ comment: '주소' })
  @IsString({
    message: stringValidationMessage,
  })
  address: string;

  @Column({ comment: '전화번호' })
  @IsCustomPhoneNumber()
  phoneNumber: string;

  @Column({ default: new Date(), comment: '마지막 로그인 날짜' })
  lastLoginDate: Date;

  @Column({ comment: '마지막 로그인 IP' })
  @IsString()
  lastLoginIp: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
    comment: '역할(관리자/일반)',
  })
  roles: RolesEnum;

  @Column({
    enum: Object.values(PermissionsEnum),
    default: PermissionsEnum.NONE,
    comment: '결제정보(없음/기본/고급/맞춤)',
  })
  permission: PermissionsEnum;

  @OneToMany(() => UsersLogModel, (log) => log.user)
  logs: UsersLogModel[];

  @OneToMany(() => GatewaysModel, (gateway) => gateway.onwer)
  gateways: GatewaysModel[];
}
