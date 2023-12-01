import { PickType } from '@nestjs/mapped-types';
import { GatewaysModel } from '../entities/gateway.entity';

export class UpdateIdGatewayDto extends PickType(GatewaysModel, [
  'countryId',
  'areaId',
  'gatewayId',
]) {}
