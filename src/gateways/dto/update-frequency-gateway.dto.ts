import { PickType } from '@nestjs/mapped-types';
import { GatewaysModel } from '../entities/gateway.entity';

export class UpdateFrequencyGatewayDto extends PickType(GatewaysModel, [
  'frequency',
  'txPower',
  'rfConfig',
]) {}
