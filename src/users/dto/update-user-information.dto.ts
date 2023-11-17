import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { IsCustomPhoneNumber } from 'src/common/decorator/is-custom-phone-number.decorator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { AbstractDto } from './abstract.dto';

export class UpdateUserInformationDto extends AbstractDto {
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  @IsOptional()
  email?: string;

  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  address?: string;

  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  name?: string;

  @IsCustomPhoneNumber()
  @IsOptional()
  phoneNumber?: string;
}
