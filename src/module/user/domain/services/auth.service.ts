import { Injectable } from '@nestjs/common';
import { User } from '../models';
import { JwtService } from '@core/jwt/jwt.service';
import { AuthResultStatus } from '@core/jwt/interfaces';

export interface UserTokenPayload {
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService<UserTokenPayload>) {}

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 2. JWT 토큰 생성
    const tokenPairResult = await this.jwtService.createTokenPair({
      userId: user.id.toString(),
    });

    if (tokenPairResult.status !== AuthResultStatus.SUCCESS) {
      throw new Error('토큰 생성 실패');
    }

    const tokens = tokenPairResult.data;

    const storeResult = await this.jwtService.storeTokenMetadata(
      tokens,
      user.id.toString(),
    );

    if (storeResult.status !== AuthResultStatus.SUCCESS) {
      throw new Error('토큰 저장 실패');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
