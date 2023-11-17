import { PickType } from '@nestjs/mapped-types';
import { GatewaysModel } from '../entities/gateway.entity';

export class CreateGatewayDto extends PickType(GatewaysModel, [
  'countryId',
  'areaId',
  'gatewayId',
  'name',
  'ssid',
  'ssidPassword',
  'frequency',
  'txPower',
  'controlScript',
  'description',
  'useYn',
  'onwer',
]) {}
