import { PickType } from '@nestjs/mapped-types';
import { GatewaysModel } from '../entities/gateway.entity';
import { IsNumber } from 'class-validator';

export class CreateGatewayDto extends PickType(GatewaysModel, [
  'countryId',
  'areaId',
  'gatewayId',
  'name',
  'ssid',
  'ssidPassword',
  'frequency',
  'txPower',
  'rfConfig',
  'controlScript',
  'location',
  'description',
  'useYn',
]) {
  @IsNumber()
  owner: number;
}
