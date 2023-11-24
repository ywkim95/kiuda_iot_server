import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class ContDevicePaginateDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  where__sensor?: string;
}
