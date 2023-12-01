import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SortEnum } from 'src/common/const/sort-enum.const';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class NotificationsPaginationDto extends BasePaginationDto {
  @IsBoolean()
  @IsOptional()
  where__deleteFlag?: boolean;
}
