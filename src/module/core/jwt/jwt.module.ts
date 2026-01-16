import { EnvironmentConfig } from '@core/config/environment.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { RedisJwtService } from './redis-jwt.service';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<EnvironmentConfig['jwt']>('jwt');

        if (!jwtConfig) {
          throw new Error('JWT 설정이 누락되었습니다.');
        }

        return {
          secret: jwtConfig.secret,
          signOptions: {
            algorithm: 'HS256',
            issuer: 'geniesoft',
            expiresIn: jwtConfig.accessTokenExpiresIn,
          },
          verifyOptions: {
            algorithms: ['HS256'],
            issuer: 'geniesoft',
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: JwtService,
      useClass: RedisJwtService,
    },
  ],
  exports: [JwtService, NestJwtModule],
})
export class JwtModule {}
