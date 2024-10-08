import { Injectable, NotFoundException } from '@nestjs/common';
import { SensorSpecPaginateDto } from './dto/paginate-specifications-sensor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SensorSpecModel } from './entities/specifications-sensor.entity';
import { CommonService } from '../../common/common.service';
import { Repository } from 'typeorm';
import { CreateSensorSpecDto } from './dto/create-specifications-sensor.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { UpdateSensorSpecDto } from './dto/update-specifications-sensor.dto';
import { isEqual } from 'lodash';
import { SensorSpecLogModel } from './entities/specifications-sensor-log.entity';
import wlogger from 'src/log/winston-logger.const';
import { ActionEnum } from 'src/common/const/action-enum.const';
import { QueryRunner as QR } from 'typeorm';
@Injectable()
export class SensorSpecService {
  constructor(
    @InjectRepository(SensorSpecModel)
    private readonly sensorSpecificationsRepository: Repository<SensorSpecModel>,
    @InjectRepository(SensorSpecLogModel)
    private readonly sensorSpecificationLogRepository: Repository<SensorSpecLogModel>,
    private readonly commonService: CommonService,
  ) {}

  // qr

  // sensorSpec qr
  getSensorSpecRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<SensorSpecModel>(SensorSpecModel)
      : this.sensorSpecificationsRepository;
  }

  // sensorSpecLog qr
  getSensorSpecLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<SensorSpecLogModel>(SensorSpecLogModel)
      : this.sensorSpecificationLogRepository;
  }

  // 제원 정보

  // 페이지네이션
  async paginateSensorSpecifications(dto: SensorSpecPaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.sensorSpecificationsRepository,
      {},
      'sensors/specifications',
    );
  }

  // 조회
  async getSensorSpecificationById(id: number) {
    const spec = await this.sensorSpecificationsRepository.findOne({
      where: {
        id,
      },
    });

    if (!spec) {
      wlogger.error(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
      throw new NotFoundException(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
    }
    return spec;
  }

  // 등록
  async createSpecification(
    dto: CreateSensorSpecDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const specRepository = this.getSensorSpecRepository(qr);
    const spec = specRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newSpec = await specRepository.save(spec);

    return newSpec;
  }

  // 수정
  async updateSpecificationById(
    id: number,
    dto: UpdateSensorSpecDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const specRepository = this.getSensorSpecRepository(qr);
    const specLogRepository = this.getSensorSpecLogRepository(qr);
    const spec = await this.getSensorSpecificationById(id);

    const comparisonData = {
      ...spec,
      ...dto,
    };

    if (isEqual(spec, comparisonData)) {
      return spec;
    }

    const newSpec = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    const specLog = this.createSensorSpecLogModel(
      spec,
      user.email,
      ActionEnum.PATCH,
      specLogRepository,
    );

    await specLogRepository.save(specLog);

    return await specRepository.save(newSpec);
  }

  // 삭제
  async deleteSpecificationById(id: number, user: UsersModel, qr?: QR) {
    const specRepository = this.getSensorSpecRepository(qr);
    const specLogRepository = this.getSensorSpecLogRepository(qr);
    const spec = await this.getSensorSpecificationById(id);

    const specLog = this.createSensorSpecLogModel(
      spec,
      user.email,
      ActionEnum.DELETE,
      specLogRepository,
    );

    await specLogRepository.save(specLog);

    return await specRepository.delete(id);
  }

  // ------------------------------------------------------------------

  // 로그 모델 생성 로직
  createSensorSpecLogModel(
    sensorSpec: SensorSpecModel,
    userEamil: string,
    actionType: ActionEnum,
    sensorSpecLogRepository: Repository<SensorSpecLogModel>,
  ) {
    return sensorSpecLogRepository.create({
      name: sensorSpec.name,
      varName: sensorSpec.varName,
      stableStart: sensorSpec.stableStart,
      stableEnd: sensorSpec.stableEnd,
      lowWarningStart: sensorSpec.lowWarningStart,
      lowWarningEnd: sensorSpec.lowWarningEnd,
      highWarningStart: sensorSpec.highWarningStart,
      highWarningEnd: sensorSpec.highWarningEnd,
      dangerStart: sensorSpec.dangerStart,
      dangerEnd: sensorSpec.dangerEnd,
      decimalPlaces: sensorSpec.decimalPlaces,
      description: sensorSpec.description,
      graphMode: sensorSpec.graphMode,
      manufacturer: sensorSpec.manufacturer,
      maxValue: sensorSpec.maxValue,
      minValue: sensorSpec.minValue,
      model: sensorSpec.model,
      modelId: sensorSpec.id,
      recordedBy: userEamil,
      unit: sensorSpec.unit,
      useYn: sensorSpec.useYn,
      actionType,
    });
  }

  // ------------------------
  async generateSpecificationSensor(user: UsersModel) {
    for (let i = 0; i < 10; i++) {
      let dto = new CreateSensorSpecDto();
      dto = {
        name: `value ${i.toString()}`,
        varName: `variable value ${i.toString()}`,
        minValue: 0,
        maxValue: 2000,
        stableStart: 10,
        stableEnd: 100,
        lowWarningStart: 0,
        lowWarningEnd: 10,
        highWarningStart: 100,
        highWarningEnd: 1000,
        dangerStart: 1000,
        dangerEnd: 2000,
        model: `abcd ${i.toString()}`,
        manufacturer: 'aaaa',
        unit: '%',
        decimalPlaces: 0,
        graphMode: 'graphMode',
        description: 'hello',
      };
      await this.createSpecification(dto, user);
    }
    return true;
  }

  // -----------------------------------------------------------
}
