import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ENV_HOST_KEY, ENV_PROTOCOL } from './const/env-keys.const';
import { SortEnum } from './const/sort-enum.const';
import { UsersModel } from '../users/entity/users.entity';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  paginate<Model extends BaseModel, PaginationDto extends BasePaginationDto>(
    dto: PaginationDto,
    repository: Repository<Model>,
    overrideFindOptions: FindManyOptions<Model> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<
    Model extends BaseModel,
    PaginationDto extends BasePaginationDto,
  >(
    dto: PaginationDto,
    repository: Repository<Model>,
    overrideFindOptions: FindManyOptions<Model> = {},
  ) {
    const findOptions = this.composeFindOptions<Model, PaginationDto>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data: data,
      total: count,
    };
  }

  private async cursorPaginate<
    Model extends BaseModel,
    PaginationDto extends BasePaginationDto,
  >(
    dto: PaginationDto,
    repository: Repository<Model>,
    overrideFindOptions: FindManyOptions<Model> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<Model, PaginationDto>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL);

    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === SortEnum.ASC) {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      // 만약에 order__areaId 기준으로 정렬을 한다면 where__areaId__more_than/where__areaId__less_than이 필요할거고
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<
    Model extends BaseModel,
    PaginationDto extends BasePaginationDto,
  >(dto: PaginationDto): FindManyOptions<Model> {
    let where: FindOptionsWhere<Model> = {};
    let order: FindOptionsOrder<Model> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }
    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<Model extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<Model> | FindOptionsOrder<Model> {
    const options: FindOptionsWhere<Model> = {};

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이 되어야합니다. 문제되는 키 값 : ${key}`,
      );
    }

    const setFilterOptions = (field: string, subfield?: string) => {
      let target = subfield ? options[field][subfield] : options[field];
      if (split[2] === 'i_like') {
        target = FILTER_MAPPER[split[2]](`%${value}%`);
      } else {
        target = FILTER_MAPPER[split[2]](value);
      }
    };

    const [_, field, operator] = split;
    const fieldList = field.split('_');

    if (fieldList.length < 1 || fieldList.length > 2) {
      throw new BadRequestException(
        `field의 구성은 '_'로 split 했을때 길이가 1 또는 2가 되어야합니다. 문제되는 키 값 : ${field}`,
      );
    }

    if (fieldList.length === 1) {
      if (!options[fieldList[0]]) {
        options[fieldList[0]] = {};
      }
      setFilterOptions(fieldList[0]);
    } else {
      if (!options[fieldList[0]]) {
        options[fieldList[0]] = {};
      }
      setFilterOptions(fieldList[0], fieldList[1]);
    }

    // if (split.length === 2) {
    //   const [_, field] = split;
    //   options[field] = value;
    // } else {
    //   const [_, field, operator] = split;

    //   if (UsersModel) {
    //     let field_list = field.split('_');

    //     if (field_list.length !== 1 && field_list.length !== 2) {
    //       throw new BadRequestException(
    //         `field의 구성은 '_'로 split 했을때 길이가 1 또는 2가 되어야합니다. 문제되는 키 값 : ${field}`,
    //       );
    //     }

    //     if (!options[field_list[0]]) {
    //       options[field_list[0]] = {};
    //     }

    //     if (field_list.length === 1) {
    //       if (operator === 'i_like') {
    //         options[field] = FILTER_MAPPER[operator](`%${value}%`);
    //       } else {
    //         options[field] = FILTER_MAPPER[operator](value);
    //       }
    //     } else {
    //       if (operator === 'i_like') {
    //         options[field_list[0]][field_list[1]] = FILTER_MAPPER[operator](
    //           `%${value}%`,
    //         );
    //       } else {
    //         options[field_list[0]][field_list[1]] =
    //           FILTER_MAPPER[operator](value);
    //       }
    //     }
    //   } else {
    //     if (operator === 'i_like') {
    //       options[field] = FILTER_MAPPER[operator](`%${value}%`);
    //     } else {
    //       options[field] = FILTER_MAPPER[operator](value);
    //     }
    //   }
    // }
    return options;
  }
}
