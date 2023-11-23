import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Delete,
  Body,
} from '@nestjs/common';

/**
 * 1. 센서 제원
 *  - 페이지네이션
 *  - 상세
 *  - 등록
 *  - 수정
 *  - 삭제
 * 2. 센서 실기기
 *  - 페이지네이션
 *  - 상세
 *  - 등록
 *  - 수정
 *  - 삭제
 *  - 매핑 정보 상세
 *  - 매핑 정보 등록
 *  - 매핑 정보 수정
 *  - 매핑 정보 삭제
 * 3. 센서 데이터
 *  - 실시간 데이터 등록
 *  - 실시간 데이터 조회
 *  - 누적 데이터 등록
 *  - 누적 데이터 조회
 */

@Controller('sensors')
export class SensorsController {
  constructor() {}

  // -----------------------------------------------------------
  // 관리자

  // -----------------------------------------------------------
  // 사용자

  // 센서 리스트
  @Get(':deviceId')
  getSensors(@Param('deviceId', ParseIntPipe) deviceId: number) {}

  // 센서 상세정보 -- 필요없음

  // 센서 수정 -- 알림범위/보정
  @Patch(':deviceId')
  patchSensors(@Param('deviceId', ParseIntPipe) deviceId: number) {}

  // 테이블 및 그래프 분리할 필요x 어차피 같은데이터 사용예정
  @Get(':deviceId/tableAndGraph')
  getTableAndGraph(@Param('deviceId', ParseIntPipe) deviceId: number) {}

  // 제어기에 매핑되는 센서 리스트
  @Get(':deviceId/list/:controllerId')
  getSensorMappingList(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('controllerId', ParseIntPipe) controllerId: number,
  ) {}

  // -----------------------------------------------------------
}
