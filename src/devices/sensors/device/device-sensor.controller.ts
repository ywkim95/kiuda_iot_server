import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateDeviceSensorDto } from './dto/create-device-sensor.dto';
import { DeviceSensorsPaginationDto } from './dto/paginate-device-sensor.dto';
import { UpdateDeviceSensorDto } from './dto/update-device-sensor.dto';
import { DeviceSensorsService } from './device-sensor.service';

@Controller('sensors/deviceSensors')
export class DeviceSensorsController {
  constructor(private readonly deviceSensorsService: DeviceSensorsService) {}

  // -----------------------------------------------------------
  // 폐기
  @Get('deviceSensors/generates')
  async generateDeviceSensors(@User() user: UsersModel) {
    await this.deviceSensorsService.generateDeviceSensors(user);

    return true;
  }
  // -----------------------------------------------------------

  // 실기기

  // 센서 실기기 등록
  @Post('deviceSensors')
  async postDeviceSensor(
    @Body() body: CreateDeviceSensorDto,
    @User() user: UsersModel,
  ) {
    return await this.deviceSensorsService.createDeviceSensor(body, user);
  }

  // 센서 실기기 페이지네이션
  @Get('deviceSensors')
  async getDeviceSensors(@Query() query: DeviceSensorsPaginationDto) {
    return await this.deviceSensorsService.paginateDeviceSensors(query);
  }

  // 센서 실기기 상세정보
  @Get('deviceSensors/:deviceSensorId')
  async getDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {
    return await this.deviceSensorsService.getDeviceSensorById(deviceSensorId);
  }

  // 센서 실기기 수정
  @Patch('deviceSensors/:deviceSensorId')
  async patchDeviceSensor(
    @Param('deviceSensorId') deviceSensorId: number,
    @Body() body: UpdateDeviceSensorDto,
    @User() user: UsersModel,
  ) {
    return await this.deviceSensorsService.updateDeviceSensorById(
      deviceSensorId,
      body,
      user,
    );
  }

  // 센서 실기기 삭제
  @Delete('deviceSensors/:deviceSensorId')
  async deleteDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {
    return await this.deviceSensorsService.deleteDeviceSensorById(
      deviceSensorId,
    );
  }
}
