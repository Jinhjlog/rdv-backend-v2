export enum AuthResultStatus {
  SUCCESS = 'SUCCESS',

  ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  BLACKLISTED_ACCESS_TOKEN = 'BLACKLISTED_ACCESS_TOKEN',

  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  BLACKLISTED_REFRESH_TOKEN = 'BLACKLISTED_REFRESH_TOKEN',

  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',

  IDENTIFIER_NOT_FOUND = 'IDENTIFIER_NOT_FOUND',

  INFRASTRUCTURE_ERROR = 'INFRASTRUCTURE_ERROR',
}

export type CreateTokenPairErrorStatus = AuthResultStatus.INFRASTRUCTURE_ERROR;

export type StoreTokenErrorStatus = AuthResultStatus.INFRASTRUCTURE_ERROR;

export type GetTokenErrorStatus =
  | AuthResultStatus.IDENTIFIER_NOT_FOUND
  | AuthResultStatus.TOKEN_NOT_FOUND
  | AuthResultStatus.INFRASTRUCTURE_ERROR;

export type VerifyAccessTokenErrorStatus =
  | AuthResultStatus.ACCESS_TOKEN_EXPIRED
  | AuthResultStatus.INVALID_ACCESS_TOKEN
  | AuthResultStatus.BLACKLISTED_ACCESS_TOKEN
  | AuthResultStatus.INFRASTRUCTURE_ERROR;

export type VerifyRefreshTokenErrorStatus =
  AuthResultStatus.INVALID_REFRESH_TOKEN;

export type RefreshAccessTokenErrorStatus =
  | AuthResultStatus.INVALID_REFRESH_TOKEN
  | AuthResultStatus.TOKEN_NOT_FOUND
  | AuthResultStatus.INFRASTRUCTURE_ERROR;

export type InvalidateTokenErrorStatus =
  | AuthResultStatus.IDENTIFIER_NOT_FOUND
  | AuthResultStatus.INVALID_ACCESS_TOKEN
  | AuthResultStatus.INFRASTRUCTURE_ERROR;
