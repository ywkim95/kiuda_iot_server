import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RealTimeDataService } from './real-time-data.service';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { LoRaEnum } from 'src/real-time-data/const/lora-enum.const';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateAlarmRangeAndCalibrateDto } from './dto/update-alarm-range-and-calibrate.dto';
import { TimeUnitEnum } from './const/time-unit.enum';

@Controller()
export class RealTimeDataController {
  constructor(private readonly realtimeService: RealTimeDataService) {}
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
  @IsPublic()
  async postLoRa(@Query() query: any, @Query('lora') lora: LoRaEnum) {
    switch (lora) {
      case LoRaEnum.CONTROL:
        // 유저 -> 서버 -> 클라이언트(iot) -> 서버임
        console.log('CONTROL');
        return '제어';
      case LoRaEnum.JOIN:
        console.log('JOIN');
        // 클라이언트(iot) -> 서버
        return '조인함';
      case LoRaEnum.UPDATE:
        console.log('UPDATE');

        await this.realtimeService.receiveData(query);
        // 클라이언트(iot) -> 서버
        // 여기에서 서비스로직을 호출한 다음
        // 서비스 로직 내에서 db저장, roomid별로 값을 보내기
        // const roomId = data.roomId; // 예시로, 데이터에서 roomId 추출
        // this.gateway.server.to(roomId).emit('data', data); <-- 대강 이런 로직으로 짜면 될듯
        return '업데이트함';
      case LoRaEnum.CUSTOM:
        console.log('CUSTOM');
        // 유저 -> 서버 -> 클라이언트(iot) -> 서버임
        return '커스텀밸류임';
    }
  }

  // 누적 데이터
  @Get('tableAndGraph/:deviceId/:timeUnit')
  async getTableAndGraph(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param(
      'timeUnit',
      new ParseEnumPipe(TimeUnitEnum, {
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      }),
    )
    timeUnit: TimeUnitEnum,
  ) {
    return await this.realtimeService.getTableAndGraph(deviceId, timeUnit);
  }

  // 알람범위&보정 요청
  @Get('alarmRangeAndCalibrate/:gatewayId')
  async getAlarmRangeAndCalibrate(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
  ) {
    return await this.realtimeService.getAlarmRangeAndCalibrateById(gatewayId);
  }

  // 알람범위&보정 수정
  @Patch('alarmRangeAndCalibrate')
  async postAlarmRangeAndCalibrate(
    @Body() body: UpdateAlarmRangeAndCalibrateDto[],
    @User() user: UsersModel,
  ) {
    return await this.realtimeService.updateAlarmRangeAndCalibrate(body, user);
  }

  // 제어기에 매핑되는 센서 리스트
  @Get(':deviceId/list/:controllerId')
  getSensorMappingList(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('controllerId', ParseIntPipe) controllerId: number,
  ) {}
}
