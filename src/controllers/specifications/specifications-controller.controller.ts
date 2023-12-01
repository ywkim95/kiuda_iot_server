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

@Controller('controllers/specifications')
@Roles(RolesEnum.ADMIN)
export class ContSpecController {
  constructor(
    private readonly controllerSpecificationsService: ContSpecService,
  ) {}

  // 제원

  // 페이지네이션
  @Get()
  async getSpecificationsControllers(@Query() query: PaginateContSpecDto) {
    return await this.controllerSpecificationsService.paginateControllerSpecifications(
      query,
    );
  }

  // 조회
  @Get(':specificationsControllerId')
  async getSpecificationsController(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
  ) {
    return await this.controllerSpecificationsService.getControllerSpecificationById(
      specificationsControllerId,
    );
  }

  // 등록
  @Post()
  async postDeivceController(
    @Body() body: CreateContSpecDto,
    @User() user: UsersModel,
  ) {
    return await this.controllerSpecificationsService.createSpecification(
      body,
      user,
    );
  }

  // 수정
  @Patch(':specificationsControllerId')
  async patchDeivceControllers(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
    @Body() body: UpdateContSpecDto,
    @User() user: UsersModel,
  ) {
    return await this.controllerSpecificationsService.updateSpecificationById(
      specificationsControllerId,
      body,
      user,
    );
  }

  // 삭제
  @Delete(':specificationsControllerId')
  async deleteDeivceControllers(
    @Param('specificationsControllerId', ParseIntPipe)
    specificationsControllerId: number,
  ) {
    return await this.controllerSpecificationsService.deleteSpecificationById(
      specificationsControllerId,
    );
  }
}
