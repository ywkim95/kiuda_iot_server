import { PickType } from '@nestjs/mapped-types';
import { ContSpecModel } from '../entities/specifications-controller.entity';
import { IsOptional, ValidateNested } from 'class-validator';
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
  specificationSteps: CreateStepDto[];
}

export class CreateStepDto {
  @IsOptional()
  id?: number;

  value: number;

  label: string;

  useYn: boolean;
}
