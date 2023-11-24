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

@Controller('controllers/deviceControllers')
export class ContDeviceController {
  constructor() {}

  // 실기기

  // 페이지네이션
  @Get()
  async getDeviceControllers(@Query() query: ContDevicePaginateDto) {}

  // 등록
  @Post()
  async postDeviceController(
    @Body() body: CreateContDeviceDto,
    @User() user: UsersModel,
  ) {}

  // 상세
  @Get(':deviceControllerId')
  async getDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {}

  // 수정
  @Patch(':deviceControllerId')
  async patchDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
    @Body() body: UpdateContDeviceDto,
    @User() user: UsersModel,
  ) {}

  // 삭제
  @Delete(':deviceControllerId')
  async deleteDeviceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {}
}
