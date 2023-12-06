import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RealTimeDataService } from './real-time-data.service';
import { IsPublic } from '../common/decorator/is-public.decorator';
import { LoRaEnum } from '../real-time-data/const/lora-enum.const';
import { TimeUnitEnum } from './const/time-unit.enum';
import { RealTimeDataSaveService } from './real-time-data-save.service';
import { isValidDate } from './const/is-valid-date.const';
import { JoinLoraDto } from './dto/lora/join-lora.dto';
import wlogger from 'src/log/winston-logger.const';

@Controller()
export class RealTimeDataController {
  constructor(
    private readonly realtimeService: RealTimeDataService,
    private readonly saveService: RealTimeDataSaveService,
  ) {}
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
        return await this.realtimeService.joinDevice(query as JoinLoraDto);
      case LoRaEnum.UPDATE:
        console.log('UPDATE');

        // 클라이언트(iot) -> 서버
        // 여기에서 서비스로직을 호출한 다음
        // 서비스 로직 내에서 db저장, roomid별로 값을 보내기
        // const roomId = data.roomId; // 예시로, 데이터에서 roomId 추출
        // this.gateway.server.to(roomId).emit('data', data); <-- 대강 이런 로직으로 짜면 될듯
        return await this.realtimeService.receiveData(query);
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
    timeUnit: TimeUnitEnum = TimeUnitEnum.MINUTE,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      wlogger.error(
        'stateDate와 endDate에 올바른 날짜형식을 기입해주세요. -- yyyy-MM-ddTHH:mm:ssZ --',
      );
      throw new BadRequestException(
        'stateDate와 endDate에 올바른 날짜형식을 기입해주세요. -- yyyy-MM-ddTHH:mm:ssZ --',
      );
    }
    const tableAndGraph = await this.saveService.getTableAndGraph(
      deviceId,
      startDate,
      endDate,
      timeUnit,
    );
    const irradiance = await this.realtimeService.getAccumulateData(deviceId);

    return {
      tableAndGraph,
      irradiance,
    };
  }
}
