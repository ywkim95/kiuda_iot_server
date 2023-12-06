import { FindManyOptions } from 'typeorm';
import { ContSpecModel } from '../entities/specifications-controller.entity';

export const contSpecOptions: FindManyOptions<ContSpecModel> = {
  relations: {
    specificationSteps: true,
  },
};
