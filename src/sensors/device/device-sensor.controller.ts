import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateSensorDeviceDto } from './dto/create-device-sensor.dto';
import { SensorDevicePaginateDto } from './dto/paginate-device-sensor.dto';
import { UpdateSensorDeviceDto } from './dto/update-device-sensor.dto';
import { SensorDeviceService } from './device-sensor.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('sensors/deviceSensors')
export class SensorDeviceController {
  constructor(private readonly deviceSensorsService: SensorDeviceService) {}

  // -----------------------------------------------------------
  // 자동생성기
  @Get('deviceSensors/generates')
  @Roles(RolesEnum.ADMIN)
  async generateDeviceSensors(@User() user: UsersModel) {
    await this.deviceSensorsService.generateDeviceSensors(user);

    return true;
  }
  // -----------------------------------------------------------

  // CRUD + Pagination

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postDeviceSensor(
    @Body() body: CreateSensorDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.deviceSensorsService.createDeviceSensor(body, user, qr);
  }

  // 페이지네이션
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getDeviceSensors(@Query() query: SensorDevicePaginateDto) {
    return await this.deviceSensorsService.paginateDeviceSensors(query);
  }

  // 조회
  @Get(':deviceSensorId')
  async getDeviceSensor(
    @Param('deviceSensorId', ParseIntPipe) deviceSensorId: number,
  ) {
    return await this.deviceSensorsService.getDeviceSensorById(deviceSensorId);
  }

  // 수정
  @Patch(':deviceSensorId')
  @UseInterceptors(TransactionInterceptor)
  async patchDeviceSensor(
    @Param('deviceSensorId', ParseIntPipe) deviceSensorId: number,
    @Body() body: UpdateSensorDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.deviceSensorsService.updateDeviceSensorById(
      deviceSensorId,
      body,
      user,
      qr,
    );
  }

  // 삭제
  @Delete(':deviceSensorId')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async deleteDeviceSensor(
    @Param('deviceSensorId', ParseIntPipe) deviceSensorId: number,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.deviceSensorsService.deleteDeviceSensorById(
      deviceSensorId,
      user,
      qr,
    );
  }
}
