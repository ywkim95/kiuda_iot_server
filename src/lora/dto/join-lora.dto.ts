import { IsNumber, IsString } from 'class-validator';
import { BaseLoraDto } from './base-lora.dto';

export class JoinLoraDto extends BaseLoraDto {
  @IsString()
  join: string;

  @IsNumber()
  freq: number;

  @IsNumber()
  power: number;

  @IsNumber()
  config: number;

  @IsString()
  ssid: string;

  @IsString()
  ssidPwd: string;
}
