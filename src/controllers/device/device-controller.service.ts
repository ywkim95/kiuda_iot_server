import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { ContDevicePaginateDto } from './dto/paginate-devices-controller.dto';
import { CreateContDeviceDto } from './dto/create-devices-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateContDeviceDto } from './dto/update-devices-controller.dto';
import { isEqual } from 'lodash';
import { ContDeviceModel } from './entities/devices-controller.entity';

@Injectable()
export class ContDeviceService {
  constructor(
    @InjectRepository(ContDeviceModel)
    private readonly deviceControllersRepository: Repository<ContDeviceModel>,
    private readonly commonService: CommonService,
  ) {}

  // 페이지네이션
  async paginateDeviceControllers(dto: ContDevicePaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.deviceControllersRepository,
      {},
      'controllers/deviceControllers',
    );
  }

  // 상세
  async getDeviceControllerById(id: number) {
    const deviceController = await this.deviceControllersRepository.findOne({
      where: {
        id,
      },
    });

    if (!deviceController) {
      throw new NotFoundException(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
    }

    return deviceController;
  }

  // 등록
  async createDeviceController(dto: CreateContDeviceDto, user: UsersModel) {
    const controllerDevice = this.deviceControllersRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });
    const newControllerDevice =
      this.deviceControllersRepository.save(controllerDevice);

    return newControllerDevice;
  }

  // 수정
  async updateDeviceControllerById(
    id: number,
    dto: UpdateContDeviceDto,
    user: UsersModel,
  ) {
    const deviceController = await this.getDeviceControllerById(id);

    const comparisonData = {
      ...deviceController,
      ...dto,
    };

    if (isEqual(deviceController, comparisonData)) {
      return deviceController;
    }
    const newDeviceController = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    return await this.deviceControllersRepository.save(newDeviceController);
  }

  // 국가, 지역, 게이트웨이, 클라이언트 아이디 4개의 값을 받아서 검색하는 로직
  async getContDeviceFromRealTime(
    countryId: string,
    areaId: string,
    gatewayId: string,
    clientId: string,
  ) {
    const device = await this.deviceControllersRepository.findOne({
      where: {
        device: {
          gateway: {
            countryId,
            areaId,
            gatewayId,
          },
          clientId,
        },
      },
    });
    if (!device) {
      throw new NotFoundException();
    }
    return device;
  }

  // 삭제
  async deleteDeviceControllerById(id: number) {
    await this.getDeviceControllerById(id);

    return await this.deviceControllersRepository.delete(id);
  }
}
