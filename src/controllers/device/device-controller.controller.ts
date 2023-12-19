import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ContDevicePaginateDto } from './dto/paginate-devices-controller.dto';
import { CreateContDeviceDto } from './dto/create-devices-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { UpdateContDeviceDto } from './dto/update-devices-controller.dto';
import { ContDeviceService } from './device-controller.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
@Controller('controllers/deviceControllers')
export class ContDeviceController {
  constructor(private readonly contDeviceService: ContDeviceService) {}

  // 실기기

  // 페이지네이션
  // adminOrMe
  @Get()
  async getDeviceControllers(@Body() body: ContDevicePaginateDto) {
    return await this.contDeviceService.paginateDeviceControllers(body);
  }

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postDeviceController(
    @Body() body: CreateContDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.contDeviceService.createDeviceController(body, user, qr);
  }

  // 상세
  // adminOrMe
  @Get(':deviceControllerId')
  async getDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {
    return await this.contDeviceService.getDeviceControllerById(
      deviceControllerId,
    );
  }

  // 수정
  // adminOrMe
  @Patch(':deviceControllerId')
  @UseInterceptors(TransactionInterceptor)
  async patchDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
    @Body() body: UpdateContDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.contDeviceService.updateDeviceControllerById(
      deviceControllerId,
      body,
      user,
      qr,
    );
  }

  // 제어기 개별값 변경
  @Patch(':deviceControllerId/each')
  @UseInterceptors(TransactionInterceptor)
  async patchdeviceControllerEach(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
    @Body() body: UpdateContDeviceDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    console.log('body', body);
    const contDevice = await this.contDeviceService.updateContDeviceByModel(
      deviceControllerId,
      body,
      user,
      qr,
    );
    console.log(contDevice);
    return contDevice;
  }

  // 삭제
  @Delete(':deviceControllerId')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async deleteDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.contDeviceService.deleteDeviceControllerById(
      deviceControllerId,
      user,
      qr,
    );
  }

  @Get('device/:deviceId')
  async getContDeviceByDeviceId(
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    const list = await this.contDeviceService.getContDeviceByDeviceId(deviceId);
    console.log(list);
    return list;
  }

  @Get('sensorList/:deviceId')
  async getSensorDevicesByMappingId(
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return await this.contDeviceService.getSensorDeviceByMappingId(deviceId);
  }
}
