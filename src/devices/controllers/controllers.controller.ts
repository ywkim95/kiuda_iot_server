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

/**
 * 제어기에 대한건 센서보단 간단한데....
 * ----- 유저 기준 -----
 * 1. 기본적인 제어기 정보는 계속 보내준다.
 * 2. 하나의 제어기 수정 시 postController(deviceControllerId, dto)로 처리
 * 3. 제어기 리스트로 수정 시 postControllers(deviceId, dto[])로 처리
 * 4. 하나의 제어기 수정 시 제어기에 매핑된 센서는 getMappingSensorFromController(deviceControllerId)로 처리
 * 5. 제어기를 수정 시 각각의 제어기마다 매핑된 센서는 getMappingSensorFromControllers(deviceControllerId[])로 처리
 *
 * ----- 관리자 추가 기능 -----
 * 1. 제원
 * 2. 디바이스컨트롤러
 * 3. 센서매핑관리
 *    1) 센서 매핑관리는 센서의 커스텀start,end,correctionValue를 가지고 설정한다.
 *    2) 현재는 하나의 값만 처리하도록 되어있지만 추후에 dc/pwm을 선택하여 dc일떄는 단일 값, pwm일때는 여러개의 값을 받을 수 있도록 한다. <- 이건 관리자에서만 할 수 있도록하자
 *    3) 값을 여러 개 설정하는경우는 값의 갯수는 최대 5개 각각의 값에 대한 처리가 필요한데 %를 기준으로 해야할지 다른걸 기준으로 해야할지 모르겠다.
 *    4) enum을 적용해서 값이 큰경우와 작은경우만 설정해서 할 수 있도록 하자 어차피 두개로 밖에 안나뉠거같으니
 *
 *
 */
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
