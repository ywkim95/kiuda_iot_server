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
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { PaginateContSpecDto } from './dto/paginate-specifications-controller.dto';
import { UpdateContSpecDto } from './dto/update-specifications-controller.dto';
import { CreateContSpecDto } from './dto/create-specifications-controller.dto';
import { ContSpecService } from './specifications-controller.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { ContSpecStepModel } from './entities/specifications-step.entity';

@Controller('controllers/specifications')
export class ContSpecController {
  constructor(private readonly contSpecService: ContSpecService) {}

  // 제원

  // 페이지네이션
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getSpecificationsControllers(@Query() query: PaginateContSpecDto) {
    return await this.contSpecService.paginateControllerSpecifications(query);
  }

  // 조회
  @Get(':specificationsControllerId')
  @Roles(RolesEnum.ADMIN)
  async getSpecificationsController(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
  ) {
    return await this.contSpecService.getControllerSpecificationById(
      specificationsControllerId,
    );
  }

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  async postDeivceController(
    @Body() body: CreateContSpecDto,
    @User() user: UsersModel,
  ) {
    const contDevice = await this.contSpecService.createSpecification(
      body,
      user,
    );
    return await this.contSpecService.getControllerSpecificationById(
      contDevice.id,
    );
  }

  // 수정
  @Patch(':specificationsControllerId')
  @Roles(RolesEnum.ADMIN)
  async patchDeivceControllers(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
    @Body() body: UpdateContSpecDto,
    @User() user: UsersModel,
  ) {
    return await this.contSpecService.updateSpecificationById(
      specificationsControllerId,
      body,
      user,
    );
  }

  // 삭제
  @Delete(':specificationsControllerId')
  @Roles(RolesEnum.ADMIN)
  async deleteDeivceControllers(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
    @User() user: UsersModel,
  ) {
    return await this.contSpecService.deleteSpecificationById(
      specificationsControllerId,
      user,
    );
  }

  // step리스트를 받아서 안에있는 리스트의 정보를 삭제
  @Delete(':specificationsControllerId/steps')
  @Roles(RolesEnum.ADMIN)
  async deleteDeviceControllersSteps(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
    @Body() body: ContSpecStepModel[],
    @User() user: UsersModel,
  ) {
    return await this.contSpecService.deleteStepsBySpecId(
      specificationsControllerId,
      body,
      user,
    );
  }
}
