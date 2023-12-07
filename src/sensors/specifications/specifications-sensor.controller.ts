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
  UseInterceptors,
} from '@nestjs/common';
import { RolesEnum } from 'src/users/const/roles.const';
import { Roles } from 'src/users/decorator/roles.decorator';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { SensorSpecPaginateDto } from './dto/paginate-specifications-sensor.dto';
import { CreateSensorSpecDto } from './dto/create-specifications-sensor.dto';
import { UpdateSensorSpecDto } from './dto/update-specifications-sensor.dto';
import { SensorSpecService } from './specifications-sensor.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
@Controller('sensors/specifications')
@Roles(RolesEnum.ADMIN)
export class SensorSpecController {
  constructor(private readonly specService: SensorSpecService) {}
  // 센서 제원

  // -----------------------------------------------------------
  // 자동생성기
  @Get('generates')
  async generateSpecificationSensors(@User() user: UsersModel) {
    await this.specService.generateSpecificationSensor(user);

    return true;
  }
  // -----------------------------------------------------------

  // 페이지네이션
  @Get()
  async getSensorSpecifications(@Query() query: SensorSpecPaginateDto) {
    return await this.specService.paginateSensorSpecifications(query);
  }

  // 조회
  @Get(':specificationsId')
  async getSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
  ) {
    return await this.specService.getSensorSpecificationById(specificationsId);
  }

  // 등록
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postSensorSpecification(
    @Body() body: CreateSensorSpecDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.specService.createSpecification(body, user, qr);
  }

  // 수정
  @Patch(':specificationsId')
  @UseInterceptors(TransactionInterceptor)
  async patchSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
    @Body() body: UpdateSensorSpecDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.specService.updateSpecificationById(
      specificationsId,
      body,
      user,
      qr,
    );
  }

  // 삭제
  @Delete(':specificationsId')
  @UseInterceptors(TransactionInterceptor)
  async deleteSensorSpecification(
    @Param('specificationsId', ParseIntPipe) specificationsId: number,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.specService.deleteSpecificationById(
      specificationsId,
      user,
      qr,
    );
  }
}
