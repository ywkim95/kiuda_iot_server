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
import { GatewaysLogModel } from './entities/gateway-log.entity';
import { UsersService } from 'src/users/users.service';
import { ActionEnum } from 'src/common/const/action-enum.const';
import { JoinLoraDto } from 'src/real-time-data/dto/lora/join-lora.dto';
import wlogger from 'src/log/winston-logger.const';
import { QueryRunner as QR } from 'typeorm';
import { splitString } from 'src/real-time-data/const/splitString.const';
@Injectable()
export class GatewaysService {
  constructor(
    @InjectRepository(GatewaysModel)
    private readonly gatewaysRepository: Repository<GatewaysModel>,
    @InjectRepository(GatewaysLogModel)
    private readonly gatewaysLogRepository: Repository<GatewaysLogModel>,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
  ) {
    /**
     * 1. 검색 + 게이트웨이 리스트 조회 - 완료
     * 2. 게이트웨이 등록
     * 3. 게이트웨이 변경(일반정보 / 중요정보) 및 기록
     * 4. 게이트웨이 삭제
     */
  }

  // qr

  // gateway qr
  getGatewayRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<GatewaysModel>(GatewaysModel)
      : this.gatewaysRepository;
  }

  // gatewayLog qr
  getGatewayLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<GatewaysLogModel>(GatewaysLogModel)
      : this.gatewaysLogRepository;
  }

  // CRUD + Pagination

  // pagination
  async paginateGateways(dto: GatewaysPaginationDto) {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  // 조회
  async getGatewayById(id: number) {
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        id,
      },
      relations: {
        devices: true,
      },
    });
    if (!gateway) {
      wlogger.error(`해당하는 게이트웨이가 없습니다! id: ${id}`);
      throw new NotFoundException(`해당하는 게이트웨이가 없습니다! id: ${id}`);
    }
    console.log(gateway);
    return gateway;
  }

  // 등록
  async createGateway(dto: CreateGatewayDto, user: UsersModel, qr?: QR) {
    const gatewayRepository = this.getGatewayRepository(qr);
    try {
      const owner = await this.usersService.getUserById(dto.owner);

      const gateway = gatewayRepository.create({
        ...dto,
        owner,
        createdBy: user.email,
      });

      const newGateway = await gatewayRepository.save(gateway);

      if (!newGateway) {
        return {
          success: false,
          gateway: null,
        };
      }

      return {
        success: true,
        gateway: newGateway,
      };
    } catch (error) {
      console.log(error);
    }
  }

  // 수정
  async updateGatewayById(
    id: number,
    dto: UpdateGatewayDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const gatewayRepository = this.getGatewayRepository(qr);

    const gatewayLogRepository = this.getGatewayLogRepository(qr);
    try {
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

      const gatewayLog = this.createGatewayLogModel(
        gateway,
        user.email,
        ActionEnum.PATCH,
        gatewayLogRepository,
      );

      await gatewayLogRepository.save(gatewayLog);

      return await gatewayRepository.save(newGateway);
    } catch (error) {
      console.log(error);
    }
  }

  // 삭제
  async deleteGatewayById(id: number, user: UsersModel, qr?: QR) {
    const gatewayRepository = this.getGatewayRepository(qr);

    const gatewayLogRepository = this.getGatewayLogRepository(qr);

    const gateway = await this.getGatewayById(id);

    const gatewayLog = this.createGatewayLogModel(
      gateway,
      user.email,
      ActionEnum.DELETE,
      gatewayLogRepository,
    );

    await gatewayLogRepository.save(gatewayLog);

    return await gatewayRepository.delete(id);
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
  async getGatewayFromRoomId(roomId: string) {
    const [countryId, areaId, gatewayId] = splitString(roomId, 3);
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        countryId,
        areaId,
        gatewayId,
      },
    });

    return gateway;
  }

  // 게이트웨이 주소(id) 변경
  async updateGatewayId(
    id: number,
    dto: UpdateIdGatewayDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const gatewayRepository = this.getGatewayRepository(qr);

    const gatewayLogRepository = this.getGatewayLogRepository(qr);

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

    const gatewayLog = this.createGatewayLogModel(
      gateway,
      user.email,
      ActionEnum.PATCH,
      gatewayLogRepository,
    );

    await gatewayLogRepository.save(gatewayLog);

    return await gatewayRepository.save(newGateway);
  }

  // 게이트웨이 ssid 변경
  async updateSsid(
    id: number,
    dto: UpdateSsidGatewayDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const gatewayRepository = this.getGatewayRepository(qr);

    const gatewayLogRepository = this.getGatewayLogRepository(qr);

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

    const gatewayLog = this.createGatewayLogModel(
      gateway,
      user.email,
      ActionEnum.PATCH,
      gatewayLogRepository,
    );

    await gatewayLogRepository.save(gatewayLog);

    return await gatewayRepository.save(newGateway);
  }

  // 게이트웨이 주파수 변경
  async updateFrequency(
    id: number,
    dto: UpdateFrequencyGatewayDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const gatewayRepository = this.getGatewayRepository(qr);

    const gatewayLogRepository = this.getGatewayLogRepository(qr);

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

    const gatewayLog = this.createGatewayLogModel(
      gateway,
      user.email,
      ActionEnum.PATCH,
      gatewayLogRepository,
    );

    await gatewayLogRepository.save(gatewayLog);

    return await gatewayRepository.save(newGateway);
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
      wlogger.error(`해당하는 게이트웨이가 없습니다! id: ${id}`);
      throw new NotFoundException(`해당하는 게이트웨이가 없습니다! id: ${id}`);
    }
    return gateway.devices;
  }
  async getGatewayFromDeviceId(deviceId: number) {
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        devices: {
          id: deviceId,
        },
      },
    });

    if (!gateway) {
      wlogger.error(
        `해당하는 디바이스 아이디를 가진 게이트웨이가 없습니다! id: ${deviceId}`,
      );
      throw new NotFoundException(
        `해당하는 디바이스 아이디를 가진 게이트웨이가 없습니다! id: ${deviceId}`,
      );
    }
    return gateway;
  }

  // 게이트웨이 로그 모델 생성
  createGatewayLogModel(
    gateway: GatewaysModel,
    userEmail: string,
    actionType: ActionEnum,
    gatewayLogRepository: Repository<GatewaysLogModel>,
  ) {
    return gatewayLogRepository.create({
      modelId: gateway.id,
      countryId: gateway.countryId,
      areaId: gateway.areaId,
      gatewayId: gateway.gatewayId,
      name: gateway.name,
      location: gateway.location,
      owner: gateway.owner,
      ssid: gateway.ssid,
      ssidPassword: gateway.ssidPassword,
      controlScript: gateway.controlScript,
      frequency: gateway.frequency,
      txPower: gateway.txPower,
      rfConfig: gateway.rfConfig,
      gatewayIdInc: gateway.gatewayIdInc,
      description: gateway.description,
      lastPkUpdateDate: gateway.lastPkUpdateDate,
      useYn: gateway.useYn,
      resetYn: gateway.resetYn,
      recordedBy: userEmail,
      actionType,
    });
  }

  // 값들을 받아 해당 값들이 일치하는 게이트웨이가 있는지 확인하는 로직
  async matchingGateway(dto: JoinLoraDto) {
    const gateway = await this.gatewaysRepository.findOne({
      where: {
        countryId: dto.ghid,
        areaId: dto.glid,
        gatewayId: dto.gid,
        frequency: dto.freq,
        txPower: dto.power,
        rfConfig: dto.config,
        ssid: dto.ssid,
        ssidPassword: dto.ssidPwd,
      },
    });

    if (!gateway) {
      wlogger.error(
        `해당하는 게이트웨이가 없습니다! countryId: ${dto.ghid}, areaId: ${dto.glid}, gatewayId: ${dto.gid}`,
      );
      throw new NotFoundException(
        `해당하는 게이트웨이가 없습니다! countryId: ${dto.ghid}, areaId: ${dto.glid}, gatewayId: ${dto.gid}`,
      );
    }
    return gateway;
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
