import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';
import { ContTypeEnum } from '../const/controller-type.enum';

export class PaginateContSpecDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  where__name__i_like?: string;

  @IsString()
  @IsOptional()
  where__varName__i_like?: string;

  @IsEnum(ContTypeEnum)
  @IsOptional()
  where__controllerType?: ContTypeEnum;
}
