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

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  /**
   * 데이터 - 센서 및 제어기 정보
   *  1) 실시간 데이터 입력 (IoT to Server)
   *  2) 실시간 데이터 조회
   *  3) 실시간 데이터의 센서 정보 수정 - 알람범위&보정 / 제어기 값 수정
   */

  /**
   * param.lora === 'j'
   * param.lora === 'u'
   * param.lora === 'c'
   * param.lora === 'cvr'
   * 분기처리
   */

  @Post()
  postLoRa(@Query() query: any, @Query('loRa') loRa: LoRaEnum) {
    switch (loRa) {
      case LoRaEnum.CONTROL:
        // 유저 -> 서버 -> 클라이언트(iot) -> 서버임
        return '';
      case LoRaEnum.JOIN:
        // 클라이언트(iot) -> 서버
        return '';
      case LoRaEnum.UPDATE:
        // 클라이언트(iot) -> 서버
        return '';
      case LoRaEnum.CUSTOM:
        // 유저 -> 서버 -> 클라이언트(iot) -> 서버임
        return '';
    }
  }

  // @Get(':dataId')
  // getRealTimeData(@Param('dataId') dataId: number) {}

  // @Patch(':dataId')
  // patchRealTimeData(@Param('dataId') dataId: number, @Body() body: any) {}
}
