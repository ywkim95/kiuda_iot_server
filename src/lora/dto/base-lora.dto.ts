import { IsEnum, IsString } from 'class-validator';
import { LoRaEnum } from '../const/lora-enum.const';

export class BaseLoraDto {
  @IsEnum(LoRaEnum, {})
  lora: LoRaEnum;

  @IsString()
  ghid: string;

  @IsString()
  glid: string;

  @IsString()
  gid: string;
}
