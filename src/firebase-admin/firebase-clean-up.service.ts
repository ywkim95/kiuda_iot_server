import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private firebaseAdminService: FirebaseAdminService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('토큰 정리 작업을 시작합니다...');
    await this.firebaseAdminService.cleanupOldTokens();
  }
}
