import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { PaginateContSpecDto } from './dto/paginate-specifications-controller.dto';
import { ContSpecModel } from './entities/specifications-controller.entity';
import { CreateContSpecDto } from './dto/create-specifications-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateContSpecDto } from './dto/update-specifications-controller.dto';
import { isEqual } from 'lodash';
import { ContSpecStepModel } from './entities/specifications-step.entity';
import { ContSpecLogModel } from './entities/specifications-log.entity';
import { ContSpecStepLogModel } from './entities/specifications-step-log.entity';

@Injectable()
export class ContSpecService {
  constructor(
    @InjectRepository(ContSpecModel)
    private readonly controllerSpecificationsRepository: Repository<ContSpecModel>,
    @InjectRepository(ContSpecLogModel)
    private readonly controllerSpecificationsLogRepository: Repository<ContSpecLogModel>,
    @InjectRepository(ContSpecStepModel)
    private readonly controllerSpecificationsStepRepository: Repository<ContSpecStepModel>,
    @InjectRepository(ContSpecStepLogModel)
    private readonly controllerSpecificationsStepLogRepository: Repository<ContSpecStepLogModel>,
    private readonly commonService: CommonService,
  ) {}

  // 페이지네이션
  async paginateControllerSpecifications(dto: PaginateContSpecDto) {
    return await this.commonService.paginate(
      dto,
      this.controllerSpecificationsRepository,
      {},
      'controllers/specifications',
    );
  }

  // 상세정보
  async getControllerSpecificationById(id: number) {
    const spec = await this.controllerSpecificationsRepository.findOne({
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
  // 나중에 프론트에서 digital만들때 그냥 0값과 1값 알아서 만들어서 보내기
  async createSpecification(dto: CreateContSpecDto, user: UsersModel) {
    const spec = this.controllerSpecificationsRepository.create({
      ...dto,
      createdBy: user.email,
    });

    const newSpec = await this.controllerSpecificationsRepository.save(spec);

    if (dto.specificationSteps && dto.specificationSteps.length > 0) {
      const specSteps = dto.specificationSteps.map((stepDto) => {
        return this.controllerSpecificationsStepRepository.create({
          ...stepDto,
          specification: newSpec,
          createdBy: user.email,
        });
      });
      await this.controllerSpecificationsStepRepository.save(specSteps);
    }

    return true;
  }

  // 수정
  async updateSpecificationById(
    id: number,
    dto: UpdateContSpecDto,
    user: UsersModel,
  ) {
    const spec = await this.getControllerSpecificationById(id);

    const comparisonData = {
      ...spec,
      ...dto,
    };

    if (isEqual(spec, comparisonData) && !dto.specificationSteps) {
      return spec;
    }

    const newSpec = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };
    await this.controllerSpecificationsRepository.save(newSpec);

    if (dto.specificationSteps) {
      for (const stepDto of dto.specificationSteps) {
        let step = await this.controllerSpecificationsStepRepository.findOne({
          where: {
            id: stepDto.id,
            specification: spec,
          },
        });

        if (step) {
          step = {
            ...step,
            ...stepDto,
            updatedBy: user.email,
            updatedAt: new Date(),
          };

          await this.controllerSpecificationsStepRepository.save(step);

          // log
          const stepLog = this.createContSpecStepLogModel(step, user.email);

          await this.controllerSpecificationsStepLogRepository.save(stepLog);
        } else {
          const newStep = this.controllerSpecificationsStepRepository.create({
            ...stepDto,
            specification: newSpec,
            createdBy: user.email,
          });
          await this.controllerSpecificationsStepRepository.save(newStep);
        }
      }
    }

    // log
    const specLog = this.createContSpecLogModel(spec, user.email);

    await this.controllerSpecificationsLogRepository.save(specLog);

    return newSpec;
  }

  // 삭제
  async deleteSpecificationById(id: number, user: UsersModel) {
    const spec = await this.getControllerSpecificationById(id);

    const specLog = this.createContSpecLogModel(spec, user.email);

    const stepsLog = spec.specificationSteps.map((step) =>
      this.createContSpecStepLogModel(step, user.email),
    );

    await Promise.all([
      await this.controllerSpecificationsLogRepository.save(specLog),
      await this.controllerSpecificationsStepLogRepository.save(stepsLog),
    ]);

    await this.controllerSpecificationsStepRepository.delete({
      specification: { id: spec.id },
    });
    await this.controllerSpecificationsRepository.delete(id);

    return true;
  }

  // 제어기 제원 로그 모델 생성 로직
  createContSpecLogModel(spec: ContSpecModel, userEmail: string) {
    return this.controllerSpecificationsLogRepository.create({
      name: spec.name,
      varName: spec.varName,
      controllerType: spec.controllerType,
      description: spec.description,
      min: spec.min,
      max: spec.max,
      modelId: spec.id,
      recordedBy: userEmail,
      step: spec.step,
      unit: spec.unit,
      useYn: spec.useYn,
    });
  }

  // 제어기 제원 스텝 로그 모델 생성 로직
  createContSpecStepLogModel(step: ContSpecStepModel, userEmail: string) {
    return this.controllerSpecificationsStepLogRepository.create({
      label: step.label,
      modelId: step.id,
      specification: step.specification,
      recordedBy: userEmail,
      useYn: step.useYn,
      value: step.value,
    });
  }
}
