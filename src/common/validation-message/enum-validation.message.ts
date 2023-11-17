import { ValidationArguments } from 'class-validator';

export const enumValidationMessage = (args: ValidationArguments) => {
  return `${args.property}/${args.constraints}/${args.targetName}/${args.object}/${args.property}`;
};
