import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

  @Post()
  postController() {}

  @Get()
  getControllers() {}

  @Patch(':controllerId')
  patchControllers(@Param('controllerId') controllerId: number) {}
}
