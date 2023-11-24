import { PickType } from '@nestjs/mapped-types';
import { ContSpecModel } from '../entities/specifications-controller.entity';

export class CreateContSpecDto extends PickType(ContSpecModel, [
  'name',
  'varName',
  'controllerType',
  'specificationSteps',
  'min',
  'max',
  'step',
  'unit',
  'useYn',
  'description',
]) {}
