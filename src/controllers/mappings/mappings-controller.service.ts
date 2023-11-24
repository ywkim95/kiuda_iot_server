import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContMapModel } from './entities/mappings-controller.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { ContMapPaginateDto } from './dto/paginate-mappings-controller.dto';
import { CreateContMapDto } from './dto/create-mappings-controller.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateContMapDto } from './dto/update-mappings-controller.dto';
import { isEqual } from 'lodash';

@Injectable()
export class ContMapService {
  constructor(
    @InjectRepository(ContMapModel)
    private readonly mappingRepository: Repository<ContMapModel>,
    private readonly commonService: CommonService,
  ) {}

  // 페이지네이션
  async paginateMappingController(dto: ContMapPaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.mappingRepository,
      {},
      'controller/mappings',
    );
  }

  // 조회
  async getMappingControllerById(id: number) {
    const mapping = await this.mappingRepository.findOne({
      where: {
        id,
      },
    });

    if (!mapping) {
      throw new NotFoundException(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
    }

    return mapping;
  }

  // 등록
  async createMapping(dto: CreateContMapDto, user: UsersModel) {
    const mapping = this.mappingRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newMapping = await this.mappingRepository.save(mapping);

    return newMapping;
  }

  // 수정
  async updateMappingById(id: number, dto: UpdateContMapDto, user: UsersModel) {
    const mapping = await this.getMappingControllerById(id);

    const comparisonData = {
      ...mapping,
      ...dto,
    };

    if (isEqual(mapping, comparisonData)) {
      return mapping;
    }

    const newMapping = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    return await this.mappingRepository.save(newMapping);
  }

  // 삭제
  async deleteMappingById(id: number) {
    await this.getMappingControllerById(id);

    return await this.mappingRepository.delete(id);
  }
}
