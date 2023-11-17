import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GatewaysModel } from './entities/gateway.entity';
import { Repository } from 'typeorm';
import { GatewaysPaginationDto } from './dto/paginate-gateway.dto';
import { CommonService } from 'src/common/common.service';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class GatewaysService {
  constructor(
    @InjectRepository(GatewaysModel)
    private readonly gatewaysRepository: Repository<GatewaysModel>,
    private readonly commonService: CommonService,
  ) {
    /**
     * 1. 검색 + 게이트웨이 리스트 조회 - 완료
     * 2. 게이트웨이 등록
     * 3. 게이트웨이 변경(일반정보 / 중요정보) 및 기록
     * 4. 게이트웨이 삭제
     */
  }

  async paginateGateways(dto: GatewaysPaginationDto) {
    return this.commonService.paginate(
      dto,
      this.gatewaysRepository,
      {
        relations: {
          onwer: true,
        },
      },
      'gateways',
    );
  }

  async generateGateways(user: UsersModel) {
    for (let i = 1; i <= 10; i++) {
      await this.gatewaysRepository.save({
        onwer: user,
        createdBy: user.email,
        updatedBy: user.email,
        countryId: i.toString(),
        areaId: (i * 2).toString(),
        gatewayId: (i * 3).toString(),
        frequency: i,
        txPower: i * 2,
        rfConfig: i,
        ssid: '123',
        ssidPassword: '456',
      });
    }
    return true;
  }
}
