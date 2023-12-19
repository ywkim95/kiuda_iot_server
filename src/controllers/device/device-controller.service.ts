import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { cloneDeep, isEqual } from 'lodash';
import { CustomSettingRangeModel } from './entities/custom-setting-range.entity';
import { SensorDeviceService } from '../../sensors/device/device-sensor.service';
import { ContDeviceLogModel } from './entities/devices-controller-log.entity';
import { UserCustomValueLogModel } from './entities/user-custom-value-log.entity';
import { CustomSettingRangeLogModel } from './entities/custom-setting-range-log.entity';
import wlogger from 'src/log/winston-logger.const';
import { DevicesService } from 'src/devices/devices.service';
import { ContSpecService } from '../specifications/specifications-controller.service';
import { ActionEnum } from 'src/common/const/action-enum.const';
import { RangeUpdateType } from 'src/sensors/device/const/range-update-type-enum.const';
import { SensorDeviceModel } from 'src/sensors/device/entities/device-sensor.entity';
import { QueryRunner as QR } from 'typeorm';
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
    private readonly contSpecService: ContSpecService,
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService,
    @Inject(forwardRef(() => SensorDeviceService))
    private readonly sensorDeviceService: SensorDeviceService,
  ) {}

  // query runner

  // contDevice qr
  getContDeviceRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<ContDeviceModel>(ContDeviceModel)
      : this.deviceControllersRepository;
  }

  // contDeviceLog qr
  getContDeviceLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<ContDeviceLogModel>(ContDeviceLogModel)
      : this.deviceControllersLogRepository;
  }

  // userCustomValue qr
  getUserCustomValueRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<UserCustomValueModel>(UserCustomValueModel)
      : this.userCustomValueRepository;
  }
  // userCustomValue Log qr
  getUserCustomValueLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<UserCustomValueLogModel>(
          UserCustomValueLogModel,
        )
      : this.userCustomValueLogRepository;
  }

  // customSettingValue qr
  getCustomSettingValueRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<CustomSettingRangeModel>(
          CustomSettingRangeModel,
        )
      : this.customSettingRangeRepository;
  }
  // customSettingValue Log qr
  getCustomSettingValueLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<CustomSettingRangeLogModel>(
          CustomSettingRangeLogModel,
        )
      : this.customSettingRangeLogRepository;
  }

  // 페이지네이션
  async paginateDeviceControllers(dto: ContDevicePaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.deviceControllersRepository,
      {
        relations: {
          customSettingRanges: true,
          specification: true,
          userCustomValues: true,
          device: true,
        },
      },
      'controllers/deviceControllers',
    );
  }

  // 등록
  async createDeviceController(
    dto: CreateContDeviceDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const contDeviceRepository = this.getContDeviceRepository(qr);

    const userCustomValueRepository = this.getUserCustomValueRepository(qr);

    const customSettingValueRepository =
      this.getCustomSettingValueRepository(qr);

    const device = await this.devicesService.getDeviceById(dto.device);

    const specification =
      await this.contSpecService.getControllerSpecificationById(
        dto.specification,
      );

    const contDevice = contDeviceRepository.create({
      ...dto,
      device,
      specification,
      createdBy: user.email,
    });

    const newContDevice = await contDeviceRepository.save(contDevice);

    if (dto.userCustomValues && dto.userCustomValues.length > 0) {
      const userCustomValues = dto.userCustomValues.map((customValue) => {
        return userCustomValueRepository.create({
          ...customValue,
          contDevice: newContDevice,
          createdBy: user.email,
        });
      });
      const newUserCustomValues =
        await userCustomValueRepository.save(userCustomValues);

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

          return customSettingValueRepository.create({
            contDevice: newContDevice,
            controllerValue:
              newContDevice.specification.specificationSteps[index]?.value,
            sensorRangeStart,
            sensorRangeEnd,
            createdBy: user.email,
          });
        });

      customSettingRanges.push(
        customSettingValueRepository.create({
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
      await customSettingValueRepository.save(customSettingRanges);
    }

    return true;
  }

  // 상세
  async getDeviceControllerById(id: number) {
    const deviceController = await this.deviceControllersRepository.findOne({
      where: {
        id,
      },
      relations: {
        customSettingRanges: true,
        specification: true,
        userCustomValues: true,
        device: true,
      },
      order: {
        id: 'ASC',
      },
    });

    if (!deviceController) {
      wlogger.error(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
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
    qr?: QR,
  ) {
    const contDeviceRepository = this.getContDeviceRepository(qr);

    const contDeviceLogRepository = this.getContDeviceLogRepository(qr);

    // 제어 디바이스 호출
    const contDevice = await this.getDeviceControllerById(id);

    // 현재 제어 디바이스와 연결된 디바이스 호출
    const device = await this.devicesService.getDeviceById(dto.device);

    // 제원 호출
    const specification =
      await this.contSpecService.getControllerSpecificationById(
        dto.specification,
      );

    // 기존값과 비교할 제어 디바이스 생성
    const comparisonData: ContDeviceModel = {
      ...contDevice,
      ...dto,
      device,
      specification,
      userCustomValues: contDevice.userCustomValues,
    };

    // 비교문 같으면 기존값 반환
    if (isEqual(contDevice, comparisonData) && !dto.userCustomValues) {
      return contDevice;
    }

    // 다른경우 수정 일자 및 계정 기록
    const newContDevice: ContDeviceModel = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    // 제어 디바이스 저장
    await contDeviceRepository.save(newContDevice);

    // 유저 커스텀 밸류가 있는 경우
    if (dto.userCustomValues) {
      // for 루프
      await this.userCustomValueAndCustomSettingRangeUpdate(
        dto,
        contDevice,
        user,
        id,
        qr,
      );
    }

    // log
    const deviceLog = this.createContDeviceLogModel(
      contDevice,
      user.email,
      ActionEnum.PATCH,
      contDeviceLogRepository,
    );

    await contDeviceLogRepository.save(deviceLog);

    return await this.getDeviceControllerById(id);
  }

  // 삭제
  async deleteDeviceControllerById(id: number, user: UsersModel, qr?: QR) {
    try {
      const contDeviceRepository = this.getContDeviceRepository(qr);

      const contDeviceLogRepository = this.getContDeviceLogRepository(qr);

      const userCustomValueRepository = this.getUserCustomValueRepository(qr);

      const userCustomValueLogRepository =
        this.getUserCustomValueLogRepository(qr);

      const customSettingRangeRepository =
        this.getCustomSettingValueRepository(qr);

      const customSettingRangeLogRepository =
        this.getCustomSettingValueLogRepository(qr);

      const contDevice = await this.getDeviceControllerById(id);

      const deviceLog = this.createContDeviceLogModel(
        contDevice,
        user.email,
        ActionEnum.DELETE,
        contDeviceLogRepository,
      );

      const customLogs = contDevice.userCustomValues.map((value) =>
        this.createUserCustomValueLogModel(
          contDevice,
          value,
          user.email,
          ActionEnum.DELETE,
          userCustomValueLogRepository,
        ),
      );

      const rangeLogs = contDevice.customSettingRanges.map((range) =>
        this.createCustomSettingRangeLogModel(
          contDevice,
          range,
          user.email,
          ActionEnum.DELETE,
          customSettingRangeLogRepository,
        ),
      );

      Promise.all([
        await userCustomValueLogRepository.save(customLogs),
        await customSettingRangeLogRepository.save(rangeLogs),
        await contDeviceLogRepository.save(deviceLog),
      ]);

      await customSettingRangeRepository.delete({
        contDevice: { id: contDevice.id },
      });

      await userCustomValueRepository.delete({
        contDevice: { id: contDevice.id },
      });

      await contDeviceRepository.delete(id);

      return true;
    } catch (error) {
      console.log(error);
      wlogger.error(error);

      throw new BadRequestException(error);
    }
  }

  // 제어기 디바이스 로그 모델 생성 로직
  createContDeviceLogModel(
    contDevice: ContDeviceModel,
    userEmail: string,
    actionType: ActionEnum,
    contDeviceLogRepository: Repository<ContDeviceLogModel>,
  ) {
    return contDeviceLogRepository.create({
      name: contDevice.name,
      varName: contDevice.varName,
      connectedDeviceId: contDevice.connectedDeviceId,
      deviceId: contDevice.device.id,
      location: contDevice.location,
      mappingSensorId: contDevice.mappingSensorId,
      modelId: contDevice.id,
      recordedBy: userEmail,
      specificationId: contDevice.specification.id,
      useYn: contDevice.useYn,
      actionType,
    });
  }

  // 유저 커스텀 밸류 로그 모델 생성 로직
  createUserCustomValueLogModel(
    contDevice: ContDeviceModel,
    value: UserCustomValueModel,
    userEmail: string,
    actionType: ActionEnum,
    userCustomValueLogRepository: Repository<UserCustomValueLogModel>,
  ) {
    return userCustomValueLogRepository.create({
      contDeviceId: contDevice.id,
      gab: value.gab,
      manualValue: value.manualValue,
      memo: value.memo,
      modelId: value.id,
      recordedBy: userEmail,
      actionType,
    });
  }

  // 커스텀 세팅 레인지 로그 모델 생성 로직
  createCustomSettingRangeLogModel(
    contDevice: ContDeviceModel,
    range: CustomSettingRangeModel,
    userEmail: string,
    actionType: ActionEnum,
    customSettingRangeLogRepository: Repository<CustomSettingRangeLogModel>,
  ) {
    return customSettingRangeLogRepository.create({
      contDeviceId: contDevice.id,
      controllerValue: range.controllerValue,
      modelId: range.id,
      sensorRangeStart: range.sensorRangeStart,
      sensorRangeEnd: range.sensorRangeEnd,
      recordedBy: userEmail,
      actionType,
    });
  }

  // -----------------------------------------------------------

  // 제어기 및 유저 커스텀 밸류 리스트 가져오기
  async getContDeviceAndUserCustomValueListByGatewayId(gatewayId: number) {
    const contDeviceAndUserCustomValueList =
      await this.deviceControllersRepository
        .createQueryBuilder('contDevice')
        .leftJoinAndSelect('contDevice.userCustomValues', 'userCustomValue')
        .leftJoin('contDevice.device', 'device')
        .leftJoin('device.gateway', 'gateway')
        .where('gateway.id = :gatewayId', { gatewayId })
        .getMany();
    // console.log(contDeviceAndUserCustomValueList);

    // if (
    //   !contDeviceAndUserCustomValueList ||
    //   contDeviceAndUserCustomValueList.length === 0
    // ) {
    //   wlogger.error('해당 게이트웨이에 디바이스 정보가 없습니다.');
    //   throw new NotFoundException(
    //     '해당 게이트웨이에 디바이스 정보가 없습니다.',
    //   );
    // }

    return contDeviceAndUserCustomValueList;
  }

  // 제어기 및 유저 커스텀 밸류 리스트 업데이트
  async updateContDeviceAndUserCustomValueList(
    list: ContDeviceModel[],
    user: UsersModel,
    qr?: QR,
  ) {
    console.log(list);
    const newList = list.map(async (model) => {
      const contDevice = await this.deviceControllersRepository.findOne({
        where: {
          id: model.id,
        },
        relations: {
          device: true,
          specification: true,
        },
      });

      if (!contDevice) {
        wlogger.error('제어디바이스의 아이디를 다시 확인해주세요.');
        throw new NotFoundException(
          '제어디바이스의 아이디를 다시 확인해주세요.',
        );
      }

      const updateContDevice: UpdateContDeviceDto = {
        ...model,
        device: contDevice.device.id,
        specification: contDevice.specification.id,
      };
      return await this.updateDeviceControllerById(
        model.id,
        updateContDevice,
        user,
        qr,
      );
    });
    return await Promise.all(newList);
  }

  private async userCustomValueAndCustomSettingRangeUpdate(
    dto: UpdateContDeviceDto,
    contDevice: ContDeviceModel,
    user: UsersModel,
    id: number,
    qr?: QR,
  ) {
    const userCustomValueRepository = this.getUserCustomValueRepository(qr);

    const userCustomValueLogRepository =
      this.getUserCustomValueLogRepository(qr);

    const customSettingRangeRepository =
      this.getCustomSettingValueRepository(qr);

    const customSettingRangeLogRepository =
      this.getCustomSettingValueLogRepository(qr);

    // 유저 커스텀 밸류 업데이트
    for (const customValue of dto.userCustomValues) {
      try {
        let value = await userCustomValueRepository.findOne({
          where: {
            id: customValue.id,
            contDevice: { id: contDevice.id },
          },
        });

        // value가 있다면 업데이트/저장 및 로그 저장
        if (value) {
          const updatedValue = {
            ...value,
            ...customValue,
            updatedBy: user.email,
            updatedAt: new Date(),
          };

          await userCustomValueRepository.save(updatedValue);

          // 로그 생성
          const customLog = this.createUserCustomValueLogModel(
            contDevice,
            value,
            user.email,
            ActionEnum.PATCH,
            userCustomValueLogRepository,
          );

          await userCustomValueLogRepository.save(customLog);
        } else {
          // 없다면 새로운 모델 생성 및 저장
          const newValue = userCustomValueRepository.create({
            ...customValue,
            contDevice: contDevice,
            createdBy: user.email,
          });

          await userCustomValueRepository.save(newValue);
        }
      } catch (error) {
        console.error('Error updating custom value:', error);
        wlogger.error('Error updating custom value:', error);
        throw new Error('Error updating custom value');
      }
    }

    // 커스텀 세팅 레인지 업데이트
    const contDeviceForCustomSettingRange =
      await this.getDeviceControllerById(id);
    // 커스텀 세팅 레인지 리스트 생성
    const customSettingRangeList =
      contDeviceForCustomSettingRange.customSettingRanges;

    // dto에 담겨있는 유저커스텀 밸류를 맵 형태로 만든다.
    // 속도 측면에서는 for나 while등보다 map이 훨씬 빠름
    const userCustomValuesMap = new Map(
      dto.userCustomValues.map((v) => [v.id, v]),
    );

    for (const customSettingRange of customSettingRangeList) {
      // 바뀐 값과 비교를 위해서 기존 값을 담아둠
      const oldRange = { ...customSettingRange };
      // isUpdated로 업데이트 되었는지 체크 기본은 false
      let isUpdated = false;

      for (const [id, newUserCustomValue] of userCustomValuesMap) {
        // contDevice의 커스텀 밸류 리스트에서 dto의 커스텀 밸류 리스트의 id와 일치하는 것을 찾는다.
        const oldUserCustomValue = contDevice.userCustomValues.find(
          (v) => v.id === id,
        );
        // oldUserCustomValue가 있는지 확인
        if (oldUserCustomValue) {
          // oldUserCustomValue 값과 커스텀레인지의 값을 비교한여 일치하는 내용이 있다면 하단의 비교구문을 적용하고 isUpdated를 true로 변경한다.
          if (
            customSettingRange.sensorRangeStart ===
            oldUserCustomValue.manualValue + 0.1
          ) {
            customSettingRange.sensorRangeStart =
              newUserCustomValue.manualValue + 0.1;
            isUpdated = true;
          }
          // 여기서도 동일하다
          if (
            customSettingRange.sensorRangeEnd === oldUserCustomValue.manualValue
          ) {
            customSettingRange.sensorRangeEnd = newUserCustomValue.manualValue;
            isUpdated = true;
          }
        }
      }

      // 위에서 바뀐 내용이 있다면 updatedAt, updatedBy에 새로운 값을 담아준다.
      if (isUpdated) {
        customSettingRange.updatedAt = new Date();
        customSettingRange.updatedBy = user.email;

        try {
          // 로그 생성
          const rangeLog = this.createCustomSettingRangeLogModel(
            contDeviceForCustomSettingRange,
            oldRange,
            user.email,
            ActionEnum.PATCH,
            customSettingRangeLogRepository,
          );

          // 로그 저장
          await customSettingRangeLogRepository.save(rangeLog);

          // 값 저장
          await customSettingRangeRepository.save(customSettingRange);
        } catch (error) {
          console.error('Error updating custom setting range:', error);
          wlogger.error('Error updating custom setting range:', error);
          throw new Error('Error updating custom setting range');
        }
      }
    }
  }

  // 만약에 co2에 매핑된 제어기가 2개라면? 컨트롤러 디바이스 테이블에서 검색을하면 결과가 2개로 나오게 되겠지
  // 그렇다는건 여기서 즉각적으로 수정하는 건 불가능한건가?라고 하기엔 생각해보니 둘다 수정해야하네 허허

  // 세팅리스트에서 커스텀 스테이블스타트 또는 엔드가 있을떄
  async updateCustomSettingRange(
    model: SensorDeviceModel,
    type: RangeUpdateType,
    userEmail: string,
    qr?: QR,
  ) {
    const contDeviceRepository = this.getContDeviceRepository(qr);
    const customSettingRangeRepository =
      this.getCustomSettingValueRepository(qr);

    const customSettingRangeLogRepository =
      this.getCustomSettingValueLogRepository(qr);

    const contDeviceList = await contDeviceRepository.find({
      where: {
        mappingSensorId: model.id,
      },
      relations: {
        customSettingRanges: true,
      },
      order: {
        id: 'ASC',
      },
    });

    console.log(contDeviceList);

    if (!contDeviceList || contDeviceList.length === 0) {
      wlogger.error('매핑된 제어기가 없습니다. 확인 바랍니다.');
      throw new NotFoundException('매핑된 제어기가 없습니다. 확인 바랍니다.');
    }

    for (let i = 0; i < contDeviceList.length; i++) {
      console.log(`길이: ${contDeviceList.length}`);
      console.log(
        `${i}번째(${type}) 모델의 값 : ${contDeviceList[i].customSettingRanges}`,
      );
      if (
        contDeviceList[i].customSettingRanges &&
        contDeviceList[i].customSettingRanges.length > 0
      ) {
        const ranges = cloneDeep(contDeviceList[i].customSettingRanges);
        ranges.sort((a, b) => a.id - b.id);
        console.log(`range's Length ${ranges.length}`);
        console.log(`range's: ${ranges[0].id}`);
        console.log(`range's: ${ranges[ranges.length - 1].id}`);

        if (type === RangeUpdateType.START) {
          ranges[0].sensorRangeStart = model.customStableStart;
          ranges[0].updatedAt = new Date();
          ranges[0].updatedBy = userEmail;
          console.log('19123958039458093485902345820948309', ranges[0]);

          const rangeLog = this.createCustomSettingRangeLogModel(
            contDeviceList[i],
            contDeviceList[i].customSettingRanges[0],
            userEmail,
            ActionEnum.PATCH,
            customSettingRangeLogRepository,
          );

          await customSettingRangeLogRepository.save(rangeLog);

          await customSettingRangeRepository.save(ranges[0]);
        }

        if (type === RangeUpdateType.END) {
          ranges[ranges.length - 1].sensorRangeEnd = model.customStableEnd;
          ranges[ranges.length - 1].updatedAt = new Date();
          ranges[ranges.length - 1].updatedBy = userEmail;
          console.log(
            'aiosdfgaoerfjghioaerjgioaerhjiogajreioghioasdfghjv',
            ranges[ranges.length - 1],
          );

          const rangeLog = this.createCustomSettingRangeLogModel(
            contDeviceList[i],
            contDeviceList[i].customSettingRanges[
              contDeviceList[i].customSettingRanges.length - 1
            ],
            userEmail,
            ActionEnum.PATCH,
            customSettingRangeLogRepository,
          );

          await customSettingRangeLogRepository.save(rangeLog);

          await customSettingRangeRepository.save(ranges[ranges.length - 1]);
        }
      }
    }
  }

  async getContDeviceByDeviceId(deviceId: number) {
    const contDeviceList = await this.deviceControllersRepository.find({
      where: {
        device: {
          id: deviceId,
        },
      },
      relations: {
        customSettingRanges: true,
        userCustomValues: true,
        specification: true,
      },
      order: {
        id: 'asc',
        userCustomValues: {
          id: 'ASC',
        },
      },
    });
    if (!contDeviceList || contDeviceList.length === 0) {
      wlogger.error(
        `getContDeviceByDeviceId / 해당 리스트가 존재하지않습니다. deviceId: ${deviceId}`,
      );
      throw new Error(
        `getContDeviceByDeviceId / 해당 리스트가 존재하지않습니다. deviceId: ${deviceId}`,
      );
    }
    return contDeviceList;
  }

  async updateContDeviceByModel(
    id: number,
    dto: UpdateContDeviceDto,
    user: UsersModel,
    qr?: QR,
  ) {
    console.log('specID', dto.specification);
    console.log('deviceID', dto.device);
    const contDeviceRepository = this.getContDeviceRepository(qr);

    const contDeviceLogRepository = this.getContDeviceLogRepository(qr);

    // 제어 디바이스 호출
    const contDevice = await this.getDeviceControllerById(id);

    // 현재 제어 디바이스와 연결된 디바이스 호출
    const device = await this.devicesService.getDeviceById(dto.device);

    // 제원 호출
    const specification = await this.contSpecService.getContSpecById(
      dto.specification,
    );

    // 기존값과 비교할 제어 디바이스 생성
    const comparisonData: ContDeviceModel = {
      ...contDevice,
      ...dto,
      device: device,
      specification: specification,
      userCustomValues: contDevice.userCustomValues,
    };

    // 비교문 같으면 기존값 반환
    if (isEqual(contDevice, comparisonData) && !dto.userCustomValues) {
      return contDevice;
    }

    // 다른경우 수정 일자 및 계정 기록
    const newContDevice: ContDeviceModel = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    // 제어 디바이스 저장
    await contDeviceRepository.save(newContDevice);

    // 유저 커스텀 밸류가 있는 경우
    if (dto.userCustomValues) {
      // for 루프
      await this.userCustomValueAndCustomSettingRangeUpdate(
        dto,
        contDevice,
        user,
        id,
        qr,
      );
    }

    // log
    const deviceLog = this.createContDeviceLogModel(
      contDevice,
      user.email,
      ActionEnum.PATCH,
      contDeviceLogRepository,
    );

    await contDeviceLogRepository.save(deviceLog);

    return await this.getDeviceControllerById(id);
  }

  async getSensorDeviceByMappingId(deviceId: number) {
    const sensorList = (
      await this.devicesService.getDeviceById(deviceId, false)
    ).sensors;
    console.log(sensorList);
    return sensorList;
  }
}
