import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

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
      throw new InternalServerErrorException();
    }
  }
}
