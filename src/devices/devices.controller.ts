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
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicePaginationDto } from './dto/paginate-device.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  async postDevice(@Body() body: CreateDeviceDto, @User() user: UsersModel) {
    return await this.devicesService.createDevice(body, user);
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
  async patchDevice(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() body: UpdateDeviceDto,
    @User() user: UsersModel,
  ) {
    return await this.devicesService.updateDeviceById(deviceId, body, user);
  }

  // 삭제
  @Delete(':deviceId')
  @Roles(RolesEnum.ADMIN)
  async deleteDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return await this.devicesService.deleteDeviceById(deviceId);
  }
}
