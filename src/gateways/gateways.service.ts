import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GatewaysModel } from './entities/gateway.entity';
import { Repository } from 'typeorm';
import { GatewaysPaginationDto } from './dto/paginate-gateway.dto';
import { CommonService } from '../common/common.service';
import { UsersModel } from '../users/entity/users.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { isEqual } from 'lodash';
import { UpdateIdGatewayDto } from './dto/update-id-gateway.dto';
import { UpdateSsidGatewayDto } from './dto/update-ssid-gateway.dto';
import { UpdateFrequencyGatewayDto } from './dto/update-frequency-gateway.dto';
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

  // CRUD + Pagination

  async paginateGateways(dto: GatewaysPaginationDto) {
    return await this.commonService.paginate(
      dto,
      this.gatewaysRepository,
      {
        relations: {
          owner: true,
        },
      },
      'gateways',
    );
  }

  async getGatewayById(id: number) {
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        id,
      },
    });
    if (!gateway) {
      throw new NotFoundException();
    }
    return gateway;
  }

  async createGateway(dto: CreateGatewayDto, user: UsersModel) {
    const gateway = this.gatewaysRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newGateway = await this.gatewaysRepository.save(gateway);

    return newGateway;
  }

  async updateGatewayById(id: number, dto: UpdateGatewayDto, user: UsersModel) {
    const gateway = await this.getGatewayById(id);

    const comparisonData = { ...gateway, ...dto };

    if (isEqual(gateway, comparisonData)) {
      return gateway;
    }

    const newGateway = {
      ...comparisonData,
      updatedAt: new Date(),
      updatedBy: user.email,
    };

    return await this.gatewaysRepository.save(newGateway);
  }

  async deleteGatewayById(id: number) {
    await this.getGatewayById(id);

    return await this.gatewaysRepository.delete(id);
  }

  // ------------------------------------------------------------------------

  // 게이트웨이 리셋
  async gatewayReset(id: number) {
    const gateway = await this.getGatewayById(id);
    /**
     * 게이트웨이를 향해 명령어 전달
     */

    return true;
  }

  // 게이트웨이 주소(id) 변경
  async updateGatewayId(id: number, dto: UpdateIdGatewayDto, user: UsersModel) {
    const gateway = await this.getGatewayById(id);

    const comparisonData = {
      ...gateway,
      ...dto,
    };
    if (isEqual(gateway, comparisonData)) {
      return gateway;
    }

    const newGateway = {
      ...comparisonData,
      updatedAt: new Date(),
      updatedBy: user.email,
      lastPkUpdateDate: new Date(),
    };

    return await this.gatewaysRepository.save(newGateway);
  }

  // 게이트웨이 ssid 변경
  async updateSsid(id: number, dto: UpdateSsidGatewayDto, user: UsersModel) {
    const gateway = await this.getGatewayById(id);

    const comparisonData = {
      ...gateway,
      ...dto,
    };
    if (isEqual(gateway, comparisonData)) {
      return gateway;
    }

    const newGateway = {
      ...comparisonData,
      updatedAt: new Date(),
      updatedBy: user.email,
    };

    return await this.gatewaysRepository.save(newGateway);
  }

  // 게이트웨이 주파수 변경
  async updateFrequency(
    id: number,
    dto: UpdateFrequencyGatewayDto,
    user: UsersModel,
  ) {
    const gateway = await this.getGatewayById(id);

    const comparisonData = {
      ...gateway,
      ...dto,
    };
    if (isEqual(gateway, comparisonData)) {
      return gateway;
    }

    const newGateway = {
      ...comparisonData,
      updatedAt: new Date(),
      updatedBy: user.email,
    };

    return await this.gatewaysRepository.save(newGateway);
  }

  // 게이트웨이 아이디를 통한 디바이스 리스트 반환
  async getDevicesFromGatewayId(id: number) {
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        id,
      },
      relations: [
        'devices',
        'devices.sensors',
        'devices.controllers',
        'devices.controllers.mappingDevices',
        'devices.controllers.mappingDevices.sensors',
      ],
      order: {
        id: 'ASC',
      },
    });

    if (!gateway) {
      throw new NotFoundException();
    }
    return gateway.devices;
  }

  // 자동생성기
  async generateGateways(user: UsersModel) {
    for (let i = 1; i <= 20; i++) {
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
