import { Module, OnModuleInit } from '@nestjs/common';
import admin from 'firebase-admin';
import { NotificationSenderService } from './notification-sender.service';
import { FcmNotificationSenderService } from './fcm-notification-sender.service';
import { FirebaseHealthService } from './firebase-health.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@core/config/environment.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: NotificationSenderService,
      useClass: FcmNotificationSenderService,
    },
    FirebaseHealthService,
  ],
  exports: [NotificationSenderService, FirebaseHealthService],
})
export class FirebaseModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const firebaseConfig =
      this.configService.get<EnvironmentConfig['firebase']>('firebase');

    if (!firebaseConfig) {
      throw new Error('Firebase 설정이 누락되었습니다.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        privateKey: firebaseConfig.privateKey,
        clientEmail: firebaseConfig.clientEmail,
      }),
    });
  }
}
