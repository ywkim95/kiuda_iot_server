import { IsNumber, IsString } from 'class-validator';
import { BaseLoraDto } from './base-lora.dto';

export class ControlLoraDto extends BaseLoraDto {
  @IsNumber()
  controlNum: number;

  @IsString()
  gpioOut1?: string;

  @IsString()
  gpioOut2?: string;

  @IsString()
  countryId?: string;

  @IsString()
  areaId?: string;

  @IsNumber()
  gateNum?: number;

  @IsString()
  clientId?: string;

  @IsString()
  ssid?: string;

  @IsString()
  ssidPwd?: string;

  @IsString()
  frequency?: string;

  @IsString()
  txPower?: string;

  @IsString()
  rfConfig?: string;
}
