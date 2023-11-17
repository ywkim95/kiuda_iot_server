import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { GatewaysPaginationDto } from './dto/paginate-gateway.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  async getGateways(@Query() query: GatewaysPaginationDto) {
    // 게이트웨이 전체 또는 일부를 가져오는 서비스 로직
    // body.onwer.email
    // body.name
    return this.gatewaysService.paginateGateways(query);
  }

  @Post()
  postGateway() {}

  @Patch(':gatewayId')
  patchGateway(@Param('gatewayId') gatewayId: number) {}

  @Get('generate')
  async generateGateways(@User() user: UsersModel) {
    return await this.gatewaysService.generateGateways(user);
  }
}
