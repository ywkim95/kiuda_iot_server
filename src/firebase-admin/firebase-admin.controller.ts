import { Body, Controller, Post, Query } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { saveFirebaseTokenDto } from './dto/save-firebase-token.dto';

@Controller('firebase')
export class FirebaseAdminController {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Post()
  async postToken(
    @Body() body: saveFirebaseTokenDto,
    @User() user: UsersModel,
  ) {
    await this.firebaseAdminService.saveOrUpdateToken(
      user,
      body.token,
      body.clientInfo,
    );
    return { message: '토큰 저장 성공' };
  }
}
