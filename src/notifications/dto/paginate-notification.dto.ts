import { IsBoolean, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class NotificationsPaginationDto extends BasePaginationDto {
  @IsBoolean()
  @IsOptional()
  where__deleteFlag?: boolean;
}
