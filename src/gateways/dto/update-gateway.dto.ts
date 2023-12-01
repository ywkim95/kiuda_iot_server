import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateGatewayDto } from './create-gateway.dto';
import { GatewaysModel } from '../entities/gateway.entity';

export class UpdateGatewayDto extends PickType(GatewaysModel, [
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
]) {}
