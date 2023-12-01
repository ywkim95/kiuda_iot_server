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
import { ContDeviceLogModel } from './entities/devices-controller-log.entity';
import { UserCustomValueLogModel } from './entities/user-custom-value-log.entity';
import { CustomSettingRangeLogModel } from './entities/custom-setting-range-log.entity';

@Injectable()
export class ContDeviceService {
  constructor(
    @InjectRepository(ContDeviceModel)
    private readonly deviceControllersRepository: Repository<ContDeviceModel>,
    @InjectRepository(ContDeviceLogModel)
    private readonly deviceControllersLogRepository: Repository<ContDeviceLogModel>,
    @InjectRepository(UserCustomValueModel)
    private readonly userCustomValueRepository: Repository<UserCustomValueModel>,
    @InjectRepository(UserCustomValueLogModel)
    private readonly userCustomValueLogRepository: Repository<UserCustomValueLogModel>,
    @InjectRepository(CustomSettingRangeModel)
    private readonly customSettingRangeRepository: Repository<CustomSettingRangeModel>,
    @InjectRepository(CustomSettingRangeLogModel)
    private readonly customSettingRangeLogRepository: Repository<CustomSettingRangeLogModel>,
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
          const comparisonData = {
            ...value,
            ...customValue,
          };
          if (isEqual(value, comparisonData)) {
            return value;
          }
          comparisonData.updatedBy = user.email;
          comparisonData.updatedAt = new Date();

          await this.userCustomValueRepository.save(comparisonData);

          // log
          const customLog = this.createUserCustomValueLogModel(
            contDevice,
            value,
            user.email,
          );

          await this.userCustomValueLogRepository.save(customLog);
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

      const customSettingRanges: CustomSettingRangeModel[] = [];

      for (let i = 0; i < userCustomValueList.length; i++) {
        let range: CustomSettingRangeModel;

        if (savedContDevice.customSettingRanges[i]) {
          range = await this.customSettingRangeRepository.findOne({
            where: {
              id: savedContDevice.customSettingRanges[i].id,
            },
          });

          if (!range) {
            throw new NotFoundException();
          }
          const rangeLog = this.createCustomSettingRangeLogModel(
            contDevice,
            range,
            user.email,
          );

          await this.customSettingRangeLogRepository.save(rangeLog);
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

    // log
    const deviceLog = this.createContDeviceLogModel(contDevice, user.email);

    await this.deviceControllersLogRepository.save(deviceLog);

    return savedContDevice;
  }

  // 삭제
  async deleteDeviceControllerById(id: number, user: UsersModel) {
    const contDevice = await this.getDeviceControllerById(id);

    const deviceLog = this.createContDeviceLogModel(contDevice, user.email);

    const customLogs = contDevice.userCustomValues.map((value) =>
      this.createUserCustomValueLogModel(contDevice, value, user.email),
    );

    const rangeLogs = contDevice.customSettingRanges.map((range) =>
      this.createCustomSettingRangeLogModel(contDevice, range, user.email),
    );

    Promise.all([
      await this.deviceControllersLogRepository.save(deviceLog),
      await this.userCustomValueLogRepository.save(customLogs),
      await this.customSettingRangeLogRepository.save(rangeLogs),
    ]);

    await this.customSettingRangeRepository.delete({
      contDevice: { id: contDevice.id },
    });

    await this.userCustomValueRepository.delete({
      contDevice: { id: contDevice.id },
    });

    return await this.deviceControllersRepository.delete(id);
  }

  // 제어기 디바이스 로그 모델 생성 로직
  createContDeviceLogModel(contDevice: ContDeviceModel, userEmail: string) {
    return this.deviceControllersLogRepository.create({
      name: contDevice.name,
      varName: contDevice.varName,
      connectedDeviceId: contDevice.connectedDeviceId,
      device: contDevice.device,
      location: contDevice.location,
      mappingSensorId: contDevice.mappingSensorId,
      modelId: contDevice.id,
      recordedBy: userEmail,
      specification: contDevice.specification,
      useYn: contDevice.useYn,
    });
  }

  // 유저 커스텀 밸류 로그 모델 생성 로직
  createUserCustomValueLogModel(
    contDevice: ContDeviceModel,
    value: UserCustomValueModel,
    userEmail: string,
  ) {
    return this.userCustomValueLogRepository.create({
      contDevice,
      gab: value.gab,
      manualValue: value.manualValue,
      memo: value.memo,
      modelId: value.id,
      recordedBy: userEmail,
    });
  }

  // 커스텀 세팅 레인지 로그 모델 생성 로직
  createCustomSettingRangeLogModel(
    contDevice: ContDeviceModel,
    range: CustomSettingRangeModel,
    userEmail: string,
  ) {
    return this.customSettingRangeLogRepository.create({
      contDevice,
      controllerValue: range.controllerValue,
      modelId: range.id,
      sensorRangeStart: range.sensorRangeStart,
      sensorRangeEnd: range.sensorRangeEnd,
      recordedBy: userEmail,
    });
  }

  // -----------------------------------------------------------

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
