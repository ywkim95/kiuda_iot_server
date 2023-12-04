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

@Injectable()
export class SensorSpecService {
  constructor(
    @InjectRepository(SensorSpecModel)
    private readonly sensorSpecificationsRepository: Repository<SensorSpecModel>,
    @InjectRepository(SensorSpecLogModel)
    private readonly sensorSpecificationLogRepository: Repository<SensorSpecLogModel>,
    private readonly commonService: CommonService,
  ) {}

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
      throw new NotFoundException(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
    }
    return spec;
  }

  // 등록
  async createSpecification(dto: CreateSensorSpecDto, user: UsersModel) {
    const spec = this.sensorSpecificationsRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newSpec = await this.sensorSpecificationsRepository.save(spec);

    return newSpec;
  }

  // 수정
  async updateSpecificationById(
    id: number,
    dto: UpdateSensorSpecDto,
    user: UsersModel,
  ) {
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

    const specLog = this.createSensorSpecLogModel(spec, user.email);

    await this.sensorSpecificationLogRepository.save(specLog);

    return await this.sensorSpecificationsRepository.save(newSpec);
  }

  // 삭제
  async deleteSpecificationById(id: number, user: UsersModel) {
    const spec = await this.getSensorSpecificationById(id);

    const specLog = this.createSensorSpecLogModel(spec, user.email);

    await this.sensorSpecificationLogRepository.save(specLog);

    return await this.sensorSpecificationsRepository.delete(id);
  }

  // ------------------------------------------------------------------

  // 로그 모델 생성 로직
  createSensorSpecLogModel(sensorSpec: SensorSpecModel, userEamil: string) {
    return this.sensorSpecificationLogRepository.create({
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
