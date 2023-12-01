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
} from '@nestjs/common';
import { ContDevicePaginateDto } from './dto/paginate-devices-controller.dto';
import { CreateContDeviceDto } from './dto/create-devices-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { UpdateContDeviceDto } from './dto/update-devices-controller.dto';
import { ContDeviceService } from './device-controller.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';

@Controller('controllers/deviceControllers')
export class ContDeviceController {
  constructor(private readonly contDeviceService: ContDeviceService) {}

  // 실기기

  // 페이지네이션
  // adminOrMe
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getDeviceControllers(@Body() body: ContDevicePaginateDto) {
    return await this.contDeviceService.paginateDeviceControllers(body);
  }

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  async postDeviceController(
    @Body() body: CreateContDeviceDto,
    @User() user: UsersModel,
  ) {
    return await this.contDeviceService.createDeviceController(body, user);
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
  async patchDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
    @Body() body: UpdateContDeviceDto,
    @User() user: UsersModel,
  ) {
    return await this.contDeviceService.updateDeviceControllerById(
      deviceControllerId,
      body,
      user,
    );
  }

  // 삭제
  @Roles(RolesEnum.ADMIN)
  @Delete(':deviceControllerId')
  async deleteDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {
    return await this.contDeviceService.deleteDeviceControllerById(
      deviceControllerId,
    );
  }
}
