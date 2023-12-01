import { PickType } from '@nestjs/mapped-types';
import { ContSpecModel } from '../entities/specifications-controller.entity';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContSpecDto extends PickType(ContSpecModel, [
  'name',
  'varName',
  'controllerType',
  'min',
  'max',
  'step',
  'unit',
  'useYn',
  'description',
]) {
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  specificationSteps: CreateStepDto[];
}

export class CreateStepDto {
  id?: number;

  value: number;

  label: string;

  useYn: boolean;
}
