import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginateContSpecDto } from './dto/paginate-specifications-controller.dto';
import { ContSpecModel } from './entities/specifications-controller.entity';
import { CreateContSpecDto } from './dto/create-specifications-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateContSpecDto } from './dto/update-specifications-controller.dto';
import { isEqual } from 'lodash';
import { ContSpecStepModel } from './entities/specifications-step.entity';
import { ContSpecLogModel } from './entities/specifications-log.entity';
import { ContSpecStepLogModel } from './entities/specifications-step-log.entity';
import { contSpecOptions } from './const/specifications-controller-options.const';
import wlogger from 'src/log/winston-logger.const';
import { ActionEnum } from 'src/common/const/action-enum.const';

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
      contSpecOptions,
      'controllers/specifications',
    );
  }

  // 상세정보
  async getControllerSpecificationById(id: number) {
    const spec = await this.controllerSpecificationsRepository.findOne({
      where: {
        id,
      },
      relations: contSpecOptions.relations,
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
  // 나중에 프론트에서 digital만들때 그냥 0값과 1값 알아서 만들어서 보내기
  async createSpecification(dto: CreateContSpecDto, user: UsersModel) {
    try {
      const spec = this.controllerSpecificationsRepository.create({
        ...dto,
        specificationSteps: [],
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

      return newSpec;
    } catch (error) {
      console.log(error);
    }
  }

  // 수정
  async updateSpecificationById(
    id: number,
    dto: UpdateContSpecDto,
    user: UsersModel,
  ) {
    const spec = await this.getControllerSpecificationById(id);

    const comparisonData: ContSpecModel = {
      ...spec,
      ...dto,
      specificationSteps: spec.specificationSteps,
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
      const existingSteps =
        await this.controllerSpecificationsStepRepository.find({
          where: {
            specification: spec,
          },
        });

      for (const stepDto of dto.specificationSteps) {
        let step = existingSteps.find((step) => step.id === stepDto.id);

        if (step) {
          step = {
            ...step,
            ...stepDto,
            updatedBy: user.email,
            updatedAt: new Date(),
          };

          await this.controllerSpecificationsStepRepository.save(step);

          // log
          const stepLog = this.createContSpecStepLogModel(
            step,
            user.email,
            ActionEnum.PATCH,
          );

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
    const specLog = this.createContSpecLogModel(
      spec,
      user.email,
      ActionEnum.PATCH,
    );

    await this.controllerSpecificationsLogRepository.save(specLog);

    return newSpec;
  }

  // 삭제
  async deleteSpecificationById(id: number, user: UsersModel) {
    const spec = await this.getControllerSpecificationById(id);

    const specLog = this.createContSpecLogModel(
      spec,
      user.email,
      ActionEnum.DELETE,
    );

    const stepsLog = spec.specificationSteps.map((step) =>
      this.createContSpecStepLogModel(step, user.email, ActionEnum.DELETE),
    );

    await Promise.all([
      await this.controllerSpecificationsLogRepository.save(specLog),
      await this.controllerSpecificationsStepLogRepository.save(stepsLog),
    ]);

    await this.controllerSpecificationsStepRepository.delete({
      specification: { id: spec.id },
    });

    return await this.controllerSpecificationsRepository.delete(id);
  }

  async deleteStepsBySpecId(
    id: number,
    body: ContSpecStepModel[],
    user: UsersModel,
  ) {
    const spec = await this.getControllerSpecificationById(id);

    try {
      for (const deleteStep of body) {
        const step = spec.specificationSteps.find(
          (step) => step.id === deleteStep.id,
        );
        if (step) {
          const stepLog = this.createContSpecStepLogModel(
            step,
            user.email,
            ActionEnum.DELETE,
          );

          await this.controllerSpecificationsStepLogRepository.save(stepLog);

          await this.controllerSpecificationsStepRepository.delete(step.id);
        }
      }
    } catch (error) {
      console.log(error);
      wlogger.error(
        `ContSpecStepModel을 확인해주시기바랍니다.${error.message}`,
      );
      throw new BadRequestException(
        `ContSpecStepModel을 확인해주시기바랍니다.${error.message}`,
      );
    }

    return true;
  }

  // 제어기 제원 로그 모델 생성 로직
  createContSpecLogModel(
    spec: ContSpecModel,
    userEmail: string,
    actionType: ActionEnum,
  ) {
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
      actionType,
    });
  }

  // 제어기 제원 스텝 로그 모델 생성 로직
  createContSpecStepLogModel(
    step: ContSpecStepModel,
    userEmail: string,
    actionType: ActionEnum,
  ) {
    return this.controllerSpecificationsStepLogRepository.create({
      label: step.label,
      modelId: step.id,
      specification: step.specification,
      recordedBy: userEmail,
      useYn: step.useYn,
      value: step.value,
      actionType,
    });
  }
}
