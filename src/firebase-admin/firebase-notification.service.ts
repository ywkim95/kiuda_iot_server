import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import wlogger from 'src/log/winston-logger.const';
import { FirebaseNotifictionException } from './exception/firebase-notifiction.exception';

@Injectable()
export class FirebaseNotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: admin.app.App,
  ) {}

  async sendPushNotification(token: string, title: string, body: string) {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    try {
      await this.firebaseAdmin.messaging().send(message);
    } catch (error) {
      wlogger.error(`firebase notification push Error! ${error.message}`);
      throw new FirebaseNotifictionException(error);
    }
  }
}
