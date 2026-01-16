import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EnvironmentConfig } from '@core/config/environment.config';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { JwtHelpers } from './utils/jwt.helpers';
import { JwtService } from './jwt.service';
import {
  AuthResult,
  AuthResultStatus,
  CreateTokenPairErrorStatus,
  CustomTokenPayload,
  GetTokenErrorStatus,
  InvalidateTokenErrorStatus,
  RefreshAccessTokenErrorStatus,
  StoreTokenErrorStatus,
  TokenPair,
  TokenPayload,
  VerifyAccessTokenErrorStatus,
  VerifyRefreshTokenErrorStatus,
} from './interfaces';
import { InjectAuthRedis } from '@core/database/decorators';

const KEY_PATTERNS = {
  refresh: (refreshToken: string) => `refresh:${refreshToken}`,
  identifier: (identifier: string) => `identifier:${identifier}`,
  blacklistAccess: (accessToken: string) => `blacklist:access:${accessToken}`,
  blacklistRefresh: (refreshToken: string) => `blacklist:${refreshToken}`,
};

@Injectable()
export class RedisJwtService implements JwtService {
  private readonly logger = new Logger(RedisJwtService.name);
  private readonly helper: JwtHelpers;
  private refreshTokenExpiresIn: number;

  constructor(
    @InjectAuthRedis() private readonly redis: Redis,
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    const jwtConfig = this.configService.get<EnvironmentConfig['jwt']>('jwt');

    if (!jwtConfig) {
      throw new Error('JWT 설정이 누락되었습니다.');
    }

    this.refreshTokenExpiresIn = jwtConfig.refreshTokenExpiresIn;
    this.helper = new JwtHelpers(this.logger);
  }

  async createTokenPair(
    payload: CustomTokenPayload,
  ): Promise<AuthResult<TokenPair, CreateTokenPairErrorStatus>> {
    try {
      const accessToken = await this.nestJwtService.signAsync({
        payload,
      });

      const refreshToken = crypto.randomBytes(64).toString('hex');

      return this.helper.success({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return this.helper.infrastructureError(error, '토큰 생성 중 오류 발생');
    }
  }

  async storeTokenMetadata(
    tokens: TokenPair,
    identifier: string,
  ): Promise<AuthResult<void, StoreTokenErrorStatus>> {
    try {
      const identifierKey = KEY_PATTERNS.identifier(identifier);
      const refreshKey = KEY_PATTERNS.refresh(tokens.refreshToken);

      const multi = this.redis.multi();
      const expiresIn = this.refreshTokenExpiresIn;

      multi.hset(identifierKey, tokens);
      multi.expire(identifierKey, expiresIn);
      multi.setex(refreshKey, expiresIn, identifier);

      await multi.exec();

      return this.helper.successVoid();
    } catch (error) {
      return this.helper.infrastructureError(
        error,
        '토큰 메타데이터 저장 중 오류 발생',
      );
    }
  }

  async getTokenByIdentifier(
    identifier: string,
  ): Promise<AuthResult<TokenPair, GetTokenErrorStatus>> {
    const identifierKey = KEY_PATTERNS.identifier(identifier);

    const result = await this.redis.hgetall(identifierKey);

    if (!result.accessToken || !result.refreshToken) {
      return this.helper.failure(
        AuthResultStatus.TOKEN_NOT_FOUND,
        '토큰 정보가 존재하지 않습니다.',
        identifier,
      );
    }

    return this.helper.success({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<
    AuthResult<TokenPayload<CustomTokenPayload>, VerifyAccessTokenErrorStatus>
  > {
    try {
      const blacklistKey = KEY_PATTERNS.blacklistAccess(accessToken);
      const isBlacklisted = await this.redis.get(blacklistKey);

      if (isBlacklisted) {
        return this.helper.failure(
          AuthResultStatus.BLACKLISTED_ACCESS_TOKEN,
          '블랙리스트에 등록된 액세스 토큰입니다.',
        );
      }

      const decoded =
        await this.nestJwtService.verifyAsync<TokenPayload<CustomTokenPayload>>(
          accessToken,
        );

      if (!decoded) {
        return this.helper.failure(
          AuthResultStatus.INVALID_ACCESS_TOKEN,
          '유효하지 않은 토큰입니다.',
        );
      }

      return this.helper.success(decoded);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return this.helper.failure(
          AuthResultStatus.ACCESS_TOKEN_EXPIRED,
          '토큰이 만료되었습니다.',
        );
      }

      if (error instanceof JsonWebTokenError) {
        return this.helper.failure(
          AuthResultStatus.INVALID_ACCESS_TOKEN,
          '유효하지 않은 토큰입니다.',
        );
      }

      return this.helper.infrastructureError(error, '토큰 검증 중 오류 발생');
    }
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<AuthResult<void, VerifyRefreshTokenErrorStatus>> {
    const isExists = await this.redis.exists(
      KEY_PATTERNS.refresh(refreshToken),
    );

    if (!isExists) {
      return this.helper.failure(
        AuthResultStatus.INVALID_REFRESH_TOKEN,
        '유효하지 않은 리프레시 토큰입니다.',
      );
    }

    return this.helper.successVoid();
  }

  async invalidateToken(
    tokens: TokenPair,
    identifier: string,
    isForce: boolean,
  ): Promise<AuthResult<void, InvalidateTokenErrorStatus>> {
    try {
      const { accessToken, refreshToken } = tokens;

      const tokenKey = KEY_PATTERNS.refresh(refreshToken);
      const identifierKey = KEY_PATTERNS.identifier(identifier);

      const identifierExists = await this.redis.exists(identifierKey);
      if (!identifierExists) {
        return this.helper.failure(
          AuthResultStatus.IDENTIFIER_NOT_FOUND,
          '식별자를 찾을 수 없습니다.',
          identifier,
        );
      }

      const decodedToken =
        this.nestJwtService.decode<TokenPayload<CustomTokenPayload>>(
          accessToken,
        );

      if (!decodedToken) {
        return this.helper.failure(
          AuthResultStatus.INVALID_ACCESS_TOKEN,
          '유효하지 않은 토큰입니다.',
          identifier,
        );
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const blacklistTokenExpiresIn = decodedToken.exp - currentTimestamp;

      const multi = this.redis.multi();

      if (blacklistTokenExpiresIn > 0) {
        const blacklistKey = KEY_PATTERNS.blacklistAccess(accessToken);
        multi.setex(blacklistKey, blacklistTokenExpiresIn, '1');
      }

      if (isForce) {
        const tokenTtl = await this.redis.ttl(tokenKey);

        if (tokenTtl > 0) {
          const refreshBlacklistKey =
            KEY_PATTERNS.blacklistRefresh(refreshToken);

          multi.setex(refreshBlacklistKey, tokenTtl, '1');
        }
      }

      multi.del(identifierKey);
      multi.del(tokenKey);

      await multi.exec();

      return this.helper.successVoid();
    } catch (error) {
      return this.helper.infrastructureError(
        error,
        '토큰 무효화 중 오류가 발생했습니다.',
      );
    }
  }

  async isAccessTokenBlacklisted(
    accessToken: string,
  ): Promise<AuthResult<void, AuthResultStatus.BLACKLISTED_ACCESS_TOKEN>> {
    const key = KEY_PATTERNS.blacklistAccess(accessToken);
    const isBlacklisted = await this.redis.exists(key);

    if (isBlacklisted) {
      return this.helper.failure(
        AuthResultStatus.BLACKLISTED_ACCESS_TOKEN,
        '블랙리스트에 등록된 액세스 토큰입니다.',
      );
    }

    return this.helper.successVoid();
  }

  async isRefreshTokenBlacklisted(
    refreshToken: string,
  ): Promise<AuthResult<void, AuthResultStatus.BLACKLISTED_REFRESH_TOKEN>> {
    const key = KEY_PATTERNS.blacklistRefresh(refreshToken);

    const isBlacklisted = await this.redis.exists(key);
    if (isBlacklisted) {
      return this.helper.failure(
        AuthResultStatus.BLACKLISTED_REFRESH_TOKEN,
        '블랙리스트에 등록된 리프레시 토큰입니다.',
      );
    }

    return this.helper.successVoid();
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthResult<string, RefreshAccessTokenErrorStatus>> {
    try {
      const tokenKey = KEY_PATTERNS.refresh(refreshToken);
      const identifier = await this.redis.get(tokenKey);

      if (!identifier) {
        return this.helper.failure(
          AuthResultStatus.INVALID_REFRESH_TOKEN,
          '리프레시 토큰이 유효하지 않습니다.',
        );
      }

      const identifierKey = KEY_PATTERNS.identifier(identifier);
      const { accessToken } = await this.redis.hgetall(identifierKey);
      if (!accessToken) {
        return this.helper.failure(
          AuthResultStatus.TOKEN_NOT_FOUND,
          '토큰 정보가 존재하지 않습니다.',
          identifier,
        );
      }

      const decodedToken =
        this.nestJwtService.decode<TokenPayload<CustomTokenPayload>>(
          accessToken,
        );

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const blacklistTokenExpiresIn = decodedToken.exp - currentTimestamp;

      const multi = this.redis.multi();

      if (blacklistTokenExpiresIn > 0) {
        const blacklistKey = KEY_PATTERNS.blacklistAccess(accessToken);
        multi.setex(blacklistKey, blacklistTokenExpiresIn, '1');
      }

      const newAccessToken = await this.nestJwtService.signAsync({
        payload: decodedToken.payload,
      });

      multi.hset(identifierKey, 'accessToken', newAccessToken);

      await multi.exec();

      return this.helper.success(newAccessToken);
    } catch (error) {
      return this.helper.infrastructureError(
        error,
        '액세스 토큰 갱신 중 오류가 발생했습니다.',
      );
    }
  }
}
