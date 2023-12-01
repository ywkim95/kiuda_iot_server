import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UsersModel } from 'src/users/entity/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { Setting } from './type/setting.type';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * 필요한 내용은
   * 알람범위&보정 수정과 제어기 전체값변경, 센서/제어기 사용유무 변경
   * 3가지를 동시에 처리할 수 있어야한다.
   * 현재 제어기 개별값변경은 있으니 제어기 전체값 변경도 할 수 있도록 추가
   * 알람범위와&보정은 확인
   * 센서/제어기 사용유무 변경은 게이트웨이 기준으로 디바이스 useYn를 뽑아오면될듯
   */

  // 세팅값 가져오기
  @Get('setting/:gatewayId')
  async getSetting(@Param('gatewayId', ParseIntPipe) gatewayId: number) {
    return await this.settingsService.getSettingValueList(gatewayId);
  }

  @Patch('setting/:gatewayId')
  async patchSetting(
    @Param('gatewayId', ParseIntPipe) gatewayId: number,
    @Body() body: Setting,
    @User() user: UsersModel,
  ) {
    return await this.settingsService.updateSetting(gatewayId, body, user);
  }
}
