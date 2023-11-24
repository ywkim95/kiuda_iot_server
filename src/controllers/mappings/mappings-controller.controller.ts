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
import { ContMapService } from './mappings-controller.service';
import { ContMapPaginateDto } from './dto/paginate-mappings-controller.dto';
import { CreateContMapDto } from './dto/create-mappings-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { UpdateContMapDto } from './dto/update-mappings-controller.dto';

@Controller('controller/mappings')
export class ContMapController {
  constructor(private readonly mappingControllersService: ContMapService) {}

  // 페이지네이션
  @Get()
  async getMappingControllers(@Query() query: ContMapPaginateDto) {
    return await this.mappingControllersService.paginateMappingController(
      query,
    );
  }

  // 조회
  @Get(':mappingsControllerId')
  async getMappingController(
    @Param('mappingsControllerId', ParseIntPipe) mappingsControllerId: number,
  ) {
    return await this.mappingControllersService.getMappingControllerById(
      mappingsControllerId,
    );
  }

  // 등록
  @Post()
  async postMappingController(
    @Body() body: CreateContMapDto,
    @User() user: UsersModel,
  ) {
    return await this.mappingControllersService.createMapping(body, user);
  }

  // 수정
  @Patch(':mappingsControllerId')
  async patchMappingController(
    @Param('mappingsControllerId', ParseIntPipe) mappingsControllerId: number,
    @Body() body: UpdateContMapDto,
    @User() user: UsersModel,
  ) {
    return await this.mappingControllersService.updateMappingById(
      mappingsControllerId,
      body,
      user,
    );
  }

  // 삭제
  @Delete(':mappingsControllerId')
  async deleteMappingControler(
    @Param('mappingsControllerId', ParseIntPipe) mappingsControllerId: number,
  ) {
    return await this.mappingControllersService.deleteMappingById(
      mappingsControllerId,
    );
  }
}
