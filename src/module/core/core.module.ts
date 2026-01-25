import { Global, Module } from '@nestjs/common';
import environmentConfig from './config/environment.config';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from './logger';
import { JwtModule } from './jwt/jwt.module';
import { RedisModule } from './database/redis.module';
import { QueueModule } from './queue/queue.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ProfanityModule } from './profanity/profanity.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [environmentConfig],
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    LoggerModule,
    RedisModule,
    JwtModule,
    DatabaseModule,
    QueueModule,
    FirebaseModule,
    ProfanityModule,
  ],
  providers: [ConfigService],
  exports: [
    ConfigService,
    RedisModule,
    DatabaseModule,
    JwtModule,
    QueueModule,
    FirebaseModule,
    ProfanityModule,
  ],
})
export class CoreModule {}
