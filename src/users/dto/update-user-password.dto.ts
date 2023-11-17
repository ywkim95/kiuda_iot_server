import { IsString, Length } from 'class-validator';
import { IsPassword } from '../decorator/is-password.decorator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { Exclude } from 'class-transformer';
import { AbstractDto } from './abstract.dto';

export class UpdateUserPasswordDto extends AbstractDto {
  @IsString({
    message: stringValidationMessage,
  })
  @IsPassword()
  @Length(6, 20, { message: lengthValidationMessage })
  @Exclude({
    toPlainOnly: true,
  })
  newPassword: string;

  @IsString({
    message: stringValidationMessage,
  })
  currentPassword: string;
}
