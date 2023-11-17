import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SensorsService } from './sensors.service';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}
  /**
   * 1. 등록
   *    1) 제원 정보 등록
   * 2. 조회
   *    1) 제원 조회
   * 3. 수정
   *    1) 제원 정보 수정
   */
  // -----------------------------------------------------------
  @Get()
  getDeviceSensors() {}

  @Get(':deviceSensorId')
  getDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {}

  @Post(':deviceSensorId')
  postDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {}

  @Patch(':deviceSensorId')
  patchDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {}

  // -----------------------------------------------------------

  @Patch(':userId/sensor/:sensorId')
  patchSensor() {}

  // -----------------------------------------------------------
}
