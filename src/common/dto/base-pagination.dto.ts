import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator';
import { SortEnum } from '../const/sort-enum.const';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 낮은 ID 부터 값을 가져오기
  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 높은 ID 부터 값을 가져오기
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsEnum(SortEnum, {})
  @IsOptional()
  order__createdAt: SortEnum = SortEnum.ASC;

  // 몇 개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take: number = 10;
}
