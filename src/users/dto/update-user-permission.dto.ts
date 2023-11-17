import { IsEnum } from 'class-validator';
import { PermissionsEnum } from '../const/permission.const';
import { enumValidationMessage } from 'src/common/validation-message/enum-validation.message';
import { AbstractDto } from './abstract.dto';

export class UpdateUserPermissionDto extends AbstractDto {
  @IsEnum(PermissionsEnum, {
    message: enumValidationMessage,
  })
  permission: PermissionsEnum;
}
