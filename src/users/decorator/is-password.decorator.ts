import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          // 길이 검사
          if (value.length < 6 || value.length > 20) {
            return false;
          }

          // 연속된 문자 또는 숫자 검사
          if (/(\d)\1{2,}/.test(value) || /([a-zA-Z])\1{2,}/.test(value)) {
            return false;
          }

          // 쉬운 비밀번호 검사
          const simplePasswords = [
            'password',
            '123456',
            'abcdef',
            '1q2w3e',
            'qwerty',
          ];
          if (simplePasswords.includes(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return '비밀번호는 6~20자 사이여야 하며, 연속된 문자나 숫자, 쉬운 비밀번호를 사용할 수 없습니다.';
        },
      },
    });
  };
}
