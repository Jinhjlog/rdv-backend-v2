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

export abstract class JwtService<
  T extends CustomTokenPayload = CustomTokenPayload,
> {
  /**
   * 토큰 쌍을 생성합니다. (accessToken, refreshToken)
   *
   * @param payload 토큰에 포함될 사용자 정보
   */
  abstract createTokenPair(
    payload: T,
  ): Promise<AuthResult<TokenPair, CreateTokenPairErrorStatus>>;

  /**
   * 토큰 정보를 데이터베이스에 저장합니다.
   *
   * @param tokens 토큰 쌍 (accessToken, refreshToken)
   * @param identifier 토큰 식별자[unique] (예: 사용자 아이디, 이메일, 폰 번호 등)
   *
   * _**중요**_ : 토큰을 저장할 때 사용되는 identifier가 **사용자 아이디**인 경우 추후 다른 메서드에서도 identifier에 **사용자 아이디**를 사용해야 합니다.
   */
  abstract storeTokenMetadata(
    tokens: TokenPair,
    identifier: string,
  ): Promise<AuthResult<void, StoreTokenErrorStatus>>;

  /**
   * 식별자를 기준으로 토큰 정보를 조회합니다.
   *
   * @param identifier 토큰 식별자 (예: 사용자 아이디, 이메일, 폰 번호 등)
   */
  abstract getTokenByIdentifier(
    identifier: string,
  ): Promise<AuthResult<TokenPair, GetTokenErrorStatus>>;

  /**
   * 액세스 토큰을 검증합니다.
   *
   * @param accessToken
   */
  abstract verifyAccessToken(
    accessToken: string,
  ): Promise<AuthResult<TokenPayload<T>, VerifyAccessTokenErrorStatus>>;

  /**
   * 리프레시 토큰을 검증합니다.
   *
   * @param refreshToken
   */
  abstract verifyRefreshToken(
    refreshToken: string,
  ): Promise<AuthResult<void, VerifyRefreshTokenErrorStatus>>;

  /**
   * 엑세스 토큰과 리프레시 토큰을 무효화합니다.
   * accessToken은 블랙리스트에 등록되며 refreshToken은 삭제됩니다.
   *
   * @param tokens 토큰 쌍 (accessToken, refreshToken)
   * @param identifier 토큰 식별자 (예: 사용자 아이디, 이메일, 폰 번호 등)
   * @param isForce 강제 무효화 여부 (false인 경우, refreshToken은 블랙 리스트에 등록되지 않음)
   */
  abstract invalidateToken(
    tokens: TokenPair,
    identifier: string,
    isForce: boolean,
  ): Promise<AuthResult<void, InvalidateTokenErrorStatus>>;

  /**
   * 액세스 토큰이 블랙리스트에 등록되어 있는지 확인합니다.
   *
   * @param accessToken 액세스 토큰
   */
  abstract isAccessTokenBlacklisted(
    accessToken: string,
  ): Promise<AuthResult<void, AuthResultStatus.BLACKLISTED_ACCESS_TOKEN>>;

  /**
   * 리프레시 토큰이 블랙리스트에 등록되어 있는지 확인합니다.
   *
   * @param refreshToken 리프레시 토큰
   */
  abstract isRefreshTokenBlacklisted(
    refreshToken: string,
  ): Promise<AuthResult<void, AuthResultStatus.BLACKLISTED_REFRESH_TOKEN>>;

  /**
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 생성합니다.
   *
   * @param refreshToken 리프레시 토큰
   */
  abstract refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthResult<string, RefreshAccessTokenErrorStatus>>;
}
