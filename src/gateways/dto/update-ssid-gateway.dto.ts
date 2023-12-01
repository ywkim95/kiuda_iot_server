import { PickType } from '@nestjs/mapped-types';
import { GatewaysModel } from '../entities/gateway.entity';

export class UpdateSsidGatewayDto extends PickType(GatewaysModel, [
  'ssid',
  'ssidPassword',
]) {}
