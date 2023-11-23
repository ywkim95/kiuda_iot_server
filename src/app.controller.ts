import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { BaseLoraDto } from './lora/dto/base-lora.dto';
import { LoRaEnum } from './lora/const/lora-enum.const';
import { IsPublic } from './common/decorator/is-public.decorator';
import { UpdateLoraDto } from './lora/dto/update-lora.dto';
import { RealTimeService } from './devices/sensors/real-time/real-time.service';

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService) {}
}
