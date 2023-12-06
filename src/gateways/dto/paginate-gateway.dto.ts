import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { SortEnum } from 'src/common/const/sort-enum.const';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class GatewaysPaginationDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  where__onwer_email__i_like?: string;

  @IsString()
  @IsOptional()
  where__name__i_like?: string;
}
