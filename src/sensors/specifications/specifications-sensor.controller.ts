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
import { RolesEnum } from 'src/users/const/roles.const';
import { Roles } from 'src/users/decorator/roles.decorator';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { SensorSpecPaginateDto } from './dto/paginate-specifications-sensor.dto';
import { CreateSensorSpecDto } from './dto/create-specifications-sensor.dto';
import { UpdateSensorSpecDto } from './dto/update-specifications-sensor.dto';
import { SensorSpecService } from './specifications-sensor.service';

@Controller('sensors/specifications')
export class SensorSpecController {
  constructor(private readonly specService: SensorSpecService) {}
  // 센서 제원

  // -----------------------------------------------------------
  // 폐기
  @Get('generates')
  async generateSpecificationSensors(@User() user: UsersModel) {
    await this.specService.generateSpecificationSensor(user);

    return true;
  }
  // -----------------------------------------------------------

  // 페이지네이션
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getSensorSpecifications(
    @Query() query: SensorSpecPaginateDto,
    // @User() user: UsersModel,
  ) {
    // await this.sensorsService.generateSpecificationSensor(user);
    return await this.specService.paginateSensorSpecifications(query);
  }

  // 상세
  @Get(':specificationsId')
  @Roles(RolesEnum.ADMIN)
  async getSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
  ) {
    return await this.specService.getSensorSpecificationById(specificationsId);
  }

  // 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  async postSensorSpecification(
    @Body() body: CreateSensorSpecDto,
    @User() user: UsersModel,
  ) {
    return await this.specService.createSpecification(body, user);
  }

  // 수정
  @Patch(':specificationsId')
  @Roles(RolesEnum.ADMIN)
  async patchSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
    @Body() body: UpdateSensorSpecDto,
    @User() user: UsersModel,
  ) {
    return await this.specService.updateSpecificationById(
      specificationsId,
      body,
      user,
    );
  }

  // 삭제
  @Delete(':specificationsId')
  async deleteSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
  ) {
    return await this.specService.deleteSpecificationById(specificationsId);
  }
}
