import { Injectable, NotFoundException } from '@nestjs/common';
import { SensorSpecificationsPaginateDto } from './dto/paginate-specifications-sensor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SensorSpecificationsModel } from './entities/specifications-sensor.entity';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { CreateSensorSpecificationsDto } from './dto/create-specifications-sensor.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateSensorSpecificationsDto } from './dto/update-specifications-sensor.dto';
import { isEqual } from 'lodash';

@Injectable()
export class SpecificationsService {
  constructor(
    @InjectRepository(SensorSpecificationsModel)
    private readonly SensorSpecificationsRepository: Repository<SensorSpecificationsModel>,
    private readonly commonService: CommonService,
  ) {}

  // 제원 정보

  // 페이지네이션
  async paginateSensorSpecifications(dto: SensorSpecificationsPaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.SensorSpecificationsRepository,
      {},
      'sensors/specifications',
    );
  }

  // 상세정보
  async getSensorSpecificationById(id: number) {
    const spec = await this.SensorSpecificationsRepository.findOne({
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
  async createSpecification(
    dto: CreateSensorSpecificationsDto,
    user: UsersModel,
  ) {
    const spec = this.SensorSpecificationsRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newSpec = await this.SensorSpecificationsRepository.save(spec);

    return newSpec;
  }

  // 수정
  async updateSpecificationById(
    id: number,
    dto: UpdateSensorSpecificationsDto,
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

    return await this.SensorSpecificationsRepository.save(newSpec);
  }

  // 삭제
  async deleteSpecificationById(id: number) {
    await this.getSensorSpecificationById(id);

    return await this.SensorSpecificationsRepository.delete(id);
  }

  // ------------------------
  async generateSpecificationSensor(user: UsersModel) {
    for (let i = 0; i < 10; i++) {
      let dto = new CreateSensorSpecificationsDto();
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
