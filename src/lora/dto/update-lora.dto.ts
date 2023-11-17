import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseLoraDto } from './base-lora.dto';

export class UpdateLoraDto extends BaseLoraDto {
  @IsString()
  cid: string;

  @IsNumber()
  rssi: number;

  @IsNumber()
  sqn: number;

  @IsNumber()
  @IsOptional()
  s1?: number;

  @IsNumber()
  @IsOptional()
  s2?: number;

  @IsNumber()
  @IsOptional()
  s3?: number;

  @IsNumber()
  @IsOptional()
  s4?: number;

  @IsNumber()
  @IsOptional()
  s5?: number;

  @IsNumber()
  @IsOptional()
  s6?: number;

  @IsNumber()
  @IsOptional()
  s7?: number;

  @IsNumber()
  @IsOptional()
  s8?: number;

  @IsNumber()
  @IsOptional()
  s9?: number;

  @IsNumber()
  @IsOptional()
  s10?: number;

  @IsNumber()
  @IsOptional()
  s11?: number;

  @IsNumber()
  @IsOptional()
  s12?: number;

  @IsNumber()
  @IsOptional()
  s13?: number;

  @IsNumber()
  @IsOptional()
  s14?: number;

  @IsNumber()
  @IsOptional()
  s15?: number;

  @IsNumber()
  @IsOptional()
  s16?: number;

  @IsNumber()
  @IsOptional()
  s17?: number;

  @IsNumber()
  @IsOptional()
  s18?: number;

  @IsNumber()
  @IsOptional()
  s19?: number;

  @IsNumber()
  @IsOptional()
  s20?: number;

  @IsString()
  gpio: string;
}
