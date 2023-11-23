import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class DevicePaginationDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  where__gateway_id__i_like?: string;

  @IsString()
  @IsOptional()
  where__name__i_like?: string;

  @IsString()
  @IsOptional()
  where__statusCode?: string;
}
