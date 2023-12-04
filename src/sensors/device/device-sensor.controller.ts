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
import { CreateSensorDeviceDto } from './dto/create-device-sensor.dto';
import { SensorDevicePaginateDto } from './dto/paginate-device-sensor.dto';
import { UpdateSensorDeviceDto } from './dto/update-device-sensor.dto';
import { SensorDeviceService } from './device-sensor.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';

@Controller('sensors/deviceSensors')
export class SensorDeviceController {
  constructor(private readonly deviceSensorsService: SensorDeviceService) {}

  // -----------------------------------------------------------
  // 자동생성기
  @Get('deviceSensors/generates')
  async generateDeviceSensors(@User() user: UsersModel) {
    await this.deviceSensorsService.generateDeviceSensors(user);

    return true;
  }
  // -----------------------------------------------------------

  // CRUD + Pagination

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  async postDeviceSensor(
    @Body() body: CreateSensorDeviceDto,
    @User() user: UsersModel,
  ) {
    return await this.deviceSensorsService.createDeviceSensor(body, user);
  }

  // 페이지네이션
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getDeviceSensors(@Query() query: SensorDevicePaginateDto) {
    return await this.deviceSensorsService.paginateDeviceSensors(query);
  }

  // 조회
  @Get(':deviceSensorId')
  async getDeviceSensor(@Param('deviceSensorId') deviceSensorId: number) {
    return await this.deviceSensorsService.getDeviceSensorById(deviceSensorId);
  }

  // 수정
  @Patch(':deviceSensorId')
  async patchDeviceSensor(
    @Param('deviceSensorId') deviceSensorId: number,
    @Body() body: UpdateSensorDeviceDto,
    @User() user: UsersModel,
  ) {
    return await this.deviceSensorsService.updateDeviceSensorById(
      deviceSensorId,
      body,
      user,
    );
  }

  // 삭제
  @Delete(':deviceSensorId')
  @Roles(RolesEnum.ADMIN)
  async deleteDeviceSensor(
    @Param('deviceSensorId') deviceSensorId: number,
    @User() user: UsersModel,
  ) {
    return await this.deviceSensorsService.deleteDeviceSensorById(
      deviceSensorId,
      user,
    );
  }
}
