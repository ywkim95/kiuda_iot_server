import {
  BadRequestException,
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
import { GatewaysService } from './gateways.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { GatewaysPaginationDto } from './dto/paginate-gateway.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateIdGatewayDto } from './dto/update-id-gateway.dto';
import { UpdateSsidGatewayDto } from './dto/update-ssid-gateway.dto';
import { UpdateFrequencyGatewayDto } from './dto/update-frequency-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import wlogger from 'src/log/winston-logger.const';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  // --------- 자동생성기 ---------
  @Get('generate')
  async generateGateways(@User() user: UsersModel) {
    return await this.gatewaysService.generateGateways(user);
  }
  // -----------------------------------------------------------
  // 관리자

  // 게이트웨이 리스트
  @Get()
  @Roles(RolesEnum.ADMIN)
  async getGateways(@Query() query: GatewaysPaginationDto) {
    // 게이트웨이 전체 또는 일부를 가져오는 서비스 로직
    // body.onwer.email
    // body.name
    return await this.gatewaysService.paginateGateways(query);
  }
  // 조회
  @Get(':gatewayId')
  @Roles(RolesEnum.ADMIN)
  async getGateway(@Param('gatewayId', ParseIntPipe) gatewayId: number) {
    return await this.gatewaysService.getGatewayById(gatewayId);
  }

  // 게이트웨이 등록
  @Post()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postGateway(
    @Body() body: CreateGatewayDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    const result = await this.gatewaysService.createGateway(body, user, qr);

    if (result.success) {
      return await this.gatewaysService.getGatewayById(result.gateway.id);
    } else {
      wlogger.error('정확한 게이트웨이 정보를 넘겨주세요.');
      throw new BadRequestException('정확한 게이트웨이 정보를 넘겨주세요.');
    }
  }

  // 게이트웨이 수정
  @Patch(':gatewayId')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async patchGateway(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: UpdateGatewayDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.gatewaysService.updateGatewayById(
      gatewayId,
      body,
      user,
      qr,
    );
  }

  // 게이트웨이 삭제
  @Delete(':gatewayId')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async deleteGateway(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.gatewaysService.deleteGatewayById(gatewayId, user, qr);
  }

  // -----------------------------------------------------------

  // 게이트웨이 단위 리셋
  @Get(':gatewayId/reset')
  async getReset(@Param('gatewayId', ParseIntPipe) gatewayId: number) {
    return this.gatewaysService.gatewayReset(gatewayId);
  }

  // 게이트웨이 변경
  @Patch(':gatewayId/id')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postGatewayId(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: UpdateIdGatewayDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.gatewaysService.updateGatewayId(
      gatewayId,
      body,
      user,
      qr,
    );
  }

  // SSID 변경
  @Patch(':gatewayId/ssid')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postSsid(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: UpdateSsidGatewayDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.gatewaysService.updateSsid(gatewayId, body, user, qr);
  }

  // 주파수변경
  @Patch(':gatewayId/frequency')
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  async postFrequency(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: UpdateFrequencyGatewayDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    return await this.gatewaysService.updateFrequency(
      gatewayId,
      body,
      user,
      qr,
    );
  }
}
