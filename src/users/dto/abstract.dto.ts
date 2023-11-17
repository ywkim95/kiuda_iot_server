import { IsEmail } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';

export abstract class AbstractDto {
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  modifiedEmail: string;
}
