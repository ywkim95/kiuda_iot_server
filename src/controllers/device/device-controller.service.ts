import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { ContDevicePaginateDto } from './dto/paginate-devices-controller.dto';
import { CreateContDeviceDto } from './dto/create-devices-controller.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { ContDeviceModel } from './entities/devices-controller.entity';
import { UpdateContDeviceDto } from './dto/update-devices-controller.dto';
import { UserCustomValueModel } from './entities/user-custom-value.entity';
import { isEqual } from 'lodash';
import { CustomSettingRangeModel } from './entities/custom-setting-range.entity';
import { SensorDeviceService } from 'src/sensors/device/device-sensor.service';

@Injectable()
export class ContDeviceService {
  constructor(
    @InjectRepository(ContDeviceModel)
    private readonly deviceControllersRepository: Repository<ContDeviceModel>,
    @InjectRepository(UserCustomValueModel)
    private readonly userCustomValueRepository: Repository<UserCustomValueModel>,
    @InjectRepository(CustomSettingRangeModel)
    private readonly customSettingRangeRepository: Repository<CustomSettingRangeModel>,
    private readonly commonService: CommonService,
    private readonly sensorDeviceService: SensorDeviceService,
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

  // 등록
  async createDeviceController(dto: CreateContDeviceDto, user: UsersModel) {
    const contDevice = this.deviceControllersRepository.create({
      ...dto,
      createdBy: user.email,
    });

    const newContDevice =
      await this.deviceControllersRepository.save(contDevice);

    if (dto.userCustomValueList && dto.userCustomValueList.length > 0) {
      const userCustomValues = dto.userCustomValueList.map((customValue) => {
        return this.userCustomValueRepository.create({
          ...customValue,
          contDevice: newContDevice,
          createdBy: user.email,
        });
      });
      const newUserCustomValues =
        await this.userCustomValueRepository.save(userCustomValues);
      // 여기부터 유저커스텀밸류에 의한 세팅레인지 만들기
      const sensor = await this.sensorDeviceService.getDeviceSensorById(
        newContDevice.mappingSensorId,
      );
      let customSettingRanges: CustomSettingRangeModel[] =
        newUserCustomValues.map((value, index) => {
          const sensorRangeStart =
            index === 0
              ? sensor.customStableStart
              : newUserCustomValues[index - 1].manualValue + 0.1;
          const sensorRangeEnd = newUserCustomValues[index].manualValue;

          return this.customSettingRangeRepository.create({
            contDevice: newContDevice,
            controllerValue:
              newContDevice.specification.specificationSteps[index]?.value,
            sensorRangeStart,
            sensorRangeEnd,
            createdBy: user.email,
          });
        });

      customSettingRanges.push(
        this.customSettingRangeRepository.create({
          contDevice: newContDevice,
          controllerValue:
            newContDevice.specification.specificationSteps[
              newUserCustomValues.length
            ]?.value,
          sensorRangeStart:
            newUserCustomValues[newUserCustomValues.length - 1].manualValue +
            0.1,
          sensorRangeEnd: sensor.customStableEnd,
          createdBy: user.email,
        }),
      );
      await this.customSettingRangeRepository.save(customSettingRanges);
    }

    return true;
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

  // 수정
  async updateDeviceControllerById(
    id: number,
    dto: UpdateContDeviceDto,
    user: UsersModel,
  ) {
    const contDevice = await this.getDeviceControllerById(id);

    const comparisonData = {
      ...contDevice,
      ...dto,
    };

    if (isEqual(contDevice, comparisonData) && !dto.userCustomValueList) {
      return contDevice;
    }

    const newContDevice = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    const savedContDevice =
      await this.deviceControllersRepository.save(newContDevice);

    if (dto.userCustomValueList) {
      for (const customValue of dto.userCustomValueList) {
        let value = await this.userCustomValueRepository.findOne({
          where: {
            id: customValue.id,
            contDevice: { id: contDevice.id },
          },
        });

        if (value) {
          value = {
            ...value,
            ...customValue,
            updatedBy: user.email,
            updatedAt: new Date(),
          };

          await this.userCustomValueRepository.save(value);
        } else {
          const newValue = this.userCustomValueRepository.create({
            ...customValue,
            contDevice: contDevice,
            createdBy: user.email,
          });

          await this.userCustomValueRepository.save(newValue);
        }
      }

      // 여기서부터 커스텀세팅레인지 수정
      const userCustomValueList = await this.userCustomValueRepository.find({
        where: {
          contDevice: {
            id: contDevice.id,
          },
        },
        order: {
          id: 'ASC',
        },
      });

      const sensor = await this.sensorDeviceService.getDeviceSensorById(
        savedContDevice.mappingSensorId,
      );

      const customSettingRanges = [];

      for (let i = 0; i < userCustomValueList.length; i++) {
        let range: CustomSettingRangeModel;

        if (savedContDevice.customSettingRanges[i]) {
          range = await this.customSettingRangeRepository.findOne({
            where: {
              id: savedContDevice.customSettingRanges[i].id,
            },
          });
        }

        const updatedRange =
          range ||
          this.customSettingRangeRepository.create({
            contDevice: savedContDevice,
            createdBy: user.email,
          });

        const sensorRangeStart =
          i === 0
            ? sensor.customStableStart
            : userCustomValueList[i - 1].manualValue + 0.1;

        const sensorRangeEnd = userCustomValueList[i].manualValue;

        Object.assign(updatedRange, {
          controllerValue:
            savedContDevice.specification.specificationSteps[i]?.value,
          sensorRangeStart,
          sensorRangeEnd,
          updatedBy: user.email,
          updatedAt: new Date(),
        });

        customSettingRanges.push(updatedRange);
      }
      const lastRange = this.customSettingRangeRepository.create({
        contDevice: savedContDevice,
        controllerValue:
          savedContDevice.specification.specificationSteps[
            userCustomValueList.length
          ]?.value,
        sensorRangeStart:
          userCustomValueList[userCustomValueList.length - 1].manualValue + 0.1,
        sensorRangeEnd: sensor.customStableEnd,
        createdBy: user.email,
      });

      customSettingRanges.push(lastRange);

      await this.customSettingRangeRepository.save(customSettingRanges);
    }
    return savedContDevice;
  }

  // 삭제
  async deleteDeviceControllerById(id: number) {
    const contDevice = await this.getDeviceControllerById(id);

    await this.customSettingRangeRepository.delete({
      contDevice: { id: contDevice.id },
    });

    await this.userCustomValueRepository.delete({
      contDevice: { id: contDevice.id },
    });

    return await this.deviceControllersRepository.delete(id);
  }

  // 제어기 및 유저 커스텀 밸류 리스트
  async getContDeviceAndUserCustomValueListByGatewayId(gatewayId: number) {
    const contDeviceAndUserCustomValueList =
      await this.deviceControllersRepository.find({
        where: {
          device: {
            gateway: {
              id: gatewayId,
            },
          },
        },
        relations: {
          userCustomValues: true,
        },
      });

    if (
      !contDeviceAndUserCustomValueList ||
      contDeviceAndUserCustomValueList.length === 0
    ) {
      throw new NotFoundException(
        '해당 게이트웨이에 디바이스 정보가 없습니다.',
      );
    }

    return contDeviceAndUserCustomValueList;
  }

  // 제어기 및 유저 커스텀 밸류 리스트 업데이트
  async updateContDeviceAndUserCustomValueList(list: ContDeviceModel[]) {
    const newList = await this.deviceControllersRepository.save(list);

    if (!newList || newList.length === 0) {
      throw new BadRequestException('잘못된 형식의 리스트를 입력하였습니다.');
    }
  }
}
