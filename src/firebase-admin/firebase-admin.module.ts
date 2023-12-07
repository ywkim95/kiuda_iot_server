import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import * as admin from 'firebase-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModel } from './entities/firebase.entity';
import { FirebaseNotificationService } from './firebase-notification.service';
import { TokenCleanupService } from './firebase-clean-up.service';
import { FirebaseAdminController } from './firebase-admin.controller';
@Module({
  imports: [TypeOrmModule.forFeature([FirebaseModel])],
  exports: [
    'FIREBASE_ADMIN',
    FirebaseNotificationService,
    FirebaseAdminService,
  ],
  controllers: [FirebaseAdminController],
  providers: [
    FirebaseAdminService,
    FirebaseNotificationService,
    TokenCleanupService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const serviceAccount = require('./../../kiuda_account_key.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        return admin;
      },
    },
  ],
})
export class FirebaseAdminModule {}
