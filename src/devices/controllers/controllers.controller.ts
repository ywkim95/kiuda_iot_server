import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';

@Controller('controllers')
export class ControllersController {
  constructor(private readonly controllersService: ControllersService) {}

  /**
   * 1. 등록
   *    1) 제원 정보 등록
   * 2. 조회
   *    1) 제원 조회
   * 3. 수정
   *    1) 제원 정보 수정
   */
  // -----------------------------------------------------------
  // 관리자

  // 게이트웨이 리스트
  @Get()
  getDeivceControllers() {}

  // 제어기 제원 리스트
  @Get(':deviceControllerId')
  getDeivceController(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {}

  // 제어기 제원 등록
  @Post()
  postDeivceController() {}

  // 제어기 제원 수정
  @Patch(':deviceControllerId')
  patchDeivceControllers(
    @Param('deviceControllerId', ParseIntPipe) deviceControllerId: number,
  ) {}

  // -----------------------------------------------------------
  // 사용자
  @Get(':gatewayId')
  getControllers(@Param('gatewayId', ParseIntPipe) gatewayId: number) {}

  @Patch(':gatewayId')
  patchControllers(@Param('gatewayId', ParseIntPipe) gatewayId: number) {}

  @Patch(':gatewayId/:controllerId')
  patchController(@Param('controllerId', ParseIntPipe) controllerId: number) {}

  // -----------------------------------------------------------
}
