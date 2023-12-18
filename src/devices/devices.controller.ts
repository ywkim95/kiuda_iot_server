import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicePaginationDto } from './dto/paginate-device.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postDevice(
    @Body() body: CreateDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.devicesService.createDevice(body, user);
  }

  // ---
  @Get('roomId/:roomId')
  @UseInterceptors(TransactionInterceptor)
  async getDeviceByRoomId(
    @Param('roomId') roomId: string,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.devicesService.getDevicesByRoomId(roomId, user, qr);
  }

  // 리스트 조회
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getDevices(@Query() query: DevicePaginationDto) {
    return await this.devicesService.paginateDevices(query);
  }

  // 조회
  @Get(':deviceId')
  async getDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return await this.devicesService.getDeviceById(deviceId);
  }

  // 수정
  @Patch(':deviceId')
  @UseInterceptors(TransactionInterceptor)
  async patchDevice(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() body: UpdateDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.devicesService.updateDeviceById(deviceId, body, user);
  }

  // 삭제
  @Delete(':deviceId')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async deleteDevice(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.devicesService.deleteDeviceById(deviceId, user);
  }
}
