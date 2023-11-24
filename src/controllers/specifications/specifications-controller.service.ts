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

@Injectable()
export class ContSpecService {
  constructor(
    @InjectRepository(ContSpecModel)
    private readonly controllerSpecificationsRepository: Repository<ContSpecModel>,
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
  async createSpecification(dto: CreateContSpecDto, user: UsersModel) {
    const spec = this.controllerSpecificationsRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newSpec = await this.controllerSpecificationsRepository.save(spec);

    return newSpec;
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

    if (isEqual(spec, comparisonData)) {
      return spec;
    }

    const newSpec = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    return await this.controllerSpecificationsRepository.save(newSpec);
  }

  // 삭제
  async deleteSpecificationById(id: number) {
    await this.getControllerSpecificationById(id);

    return await this.controllerSpecificationsRepository.delete(id);
  }
}
