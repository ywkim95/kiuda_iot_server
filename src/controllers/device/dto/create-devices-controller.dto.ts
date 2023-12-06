import { PickType } from '@nestjs/mapped-types';
import { ContDeviceModel } from '../entities/devices-controller.entity';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContDeviceDto extends PickType(ContDeviceModel, [
  'name',
  'varName',
  'location',
  'useYn',
  'mappingSensorId',
  'connectedDeviceId',
]) {
  @ValidateNested({ each: true })
  userCustomValues: CreateUserCustomValueDto[];

  @IsNumber()
  device: number;

  @IsNumber()
  specification: number;
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
