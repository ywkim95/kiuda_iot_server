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
import { GatewaysService } from './gateways.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { GatewaysPaginationDto } from './dto/paginate-gateway.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  // --------- 폐기 ---------
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
  async postGateway(@Body() body: CreateGatewayDto, @User() user: UsersModel) {
    return await this.gatewaysService.createGateway(body, user);
  }

  // 게이트웨이 수정
  @Patch(':gatewayId')
  @Roles(RolesEnum.ADMIN)
  async patchGateway(@Param('gatewayId', ParseIntPipe) gatewayId: number) {}

  // 게이트웨이 삭제
  @Delete(':gatewayId')
  @Roles(RolesEnum.ADMIN)
  async deleteGateway(@Param('gatewayId', ParseIntPipe) gatewayId: number) {}

  // -----------------------------------------------------------
  // 사용자

  // 게이트웨이 단위 리셋
  @Get(':gatewayId/reset')
  getReset(@Param('gatewayId', ParseIntPipe) gatewayId: number) {}

  // 사용유무 변경
  @Post(':gatewayId/useYn')
  postUseYn(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: string[],
  ) {}
  // -----------------------------------------------------------
}
