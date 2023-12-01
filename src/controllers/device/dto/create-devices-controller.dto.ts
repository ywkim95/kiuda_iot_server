import { PickType } from '@nestjs/mapped-types';
import { ContDeviceModel } from '../entities/devices-controller.entity';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContDeviceDto extends PickType(ContDeviceModel, [
  'device',
  'name',
  'varName',
  'location',
  'useYn',
  'specification',
  'mappingSensorId',
  'connectedDeviceId',
]) {
  @ValidateNested({ each: true })
  @Type(() => CreateUserCustomValueDto)
  userCustomValueList: CreateUserCustomValueDto[];
}

export class CreateUserCustomValueDto {
  id?: number;

  manualValue: number;

  gab: number;

  memo: string;
}

/**
 * 
    {
      @ValidateNested({ each: true })
      @Type(() => CreateDeviceContMapDto)
      mappingList: CreateDeviceContMapDto[];
    }

    export class CreateDeviceContMapDto {
      id?: number;
      label: string;
      sensorRangeStart: number;
      sensorRangeEnd: number;
      useYn: boolean;
      controllerValue: number;
    }

 */
