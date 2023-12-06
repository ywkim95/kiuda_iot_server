import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateGatewayDto } from './create-gateway.dto';
import { GatewaysModel } from '../entities/gateway.entity';

class UpdateGatewayDtoPick extends PickType(GatewaysModel, [
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

export class UpdateGatewayDto extends PartialType(UpdateGatewayDtoPick) {}
