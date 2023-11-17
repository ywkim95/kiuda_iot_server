import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCustomPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /^(01[016789]-\d{3,4}-\d{4}|02-\d{3,4}-\d{4}|0[3-9]\d{1}-\d{3,4}-\d{4})$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}에 올바른 전화번호 형식(예: 010-0000-0000, 02-000-0000, 031-000-0000)을 입력해주세요!`;
        },
      },
    });
  };
}