export type EnvironmentConfig = {
  database: {
    url: string;
  };
  redis: {
    url: string;
    password?: string;
    authDB: number;
    meetingRoomDB: number;
    queueDB: number;
  };
  jwt: {
    secret: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    enableRefreshToken: boolean;
    enableBlacklist: boolean;
  };
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
  logger: {
    level: 'debug' | 'info' | 'warn' | 'error';
    directory: string;
    maxFiles: string;
    maxSize: string;
  };
};

function validateEnvVariables(config: EnvironmentConfig) {
  const missingVariables: string[] = [];

  if (!config.database.url) missingVariables.push('DATABASE_URL');

  if (!config.redis.url) missingVariables.push('REDIS_URL');
  if (config.redis.authDB === -1) missingVariables.push('REDIS_AUTH_DB');
  if (config.redis.meetingRoomDB === -1)
    missingVariables.push('REDIS_MEETING_ROOM_DB');
  if (config.redis.queueDB === -1) missingVariables.push('REDIS_QUEUE_DB');

  if (!config.jwt.secret) missingVariables.push('JWT_SECRET');

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingVariables.join(', ')}`,
    );
  }
}

export default (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    database: {
      url: process.env.DATABASE_URL || '',
    },
    redis: {
      url: process.env.REDIS_URL || '',
      password: process.env.REDIS_PASSWORD,
      authDB: process.env.REDIS_AUTH_DB
        ? parseInt(process.env.REDIS_AUTH_DB, 10)
        : -1,
      meetingRoomDB: process.env.REDIS_MEETING_ROOM_DB
        ? parseInt(process.env.REDIS_MEETING_ROOM_DB, 10)
        : -1,
      queueDB: process.env.REDIS_QUEUE_DB
        ? parseInt(process.env.REDIS_QUEUE_DB, 10)
        : -1,
    },
    jwt: {
      secret: process.env.JWT_SECRET || '',
      accessTokenExpiresIn: parseInt(
        process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
        10,
      ),
      refreshTokenExpiresIn: parseInt(
        process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '86400',
        10,
      ),
      enableRefreshToken: process.env.ENABLE_REFRESH_TOKEN !== 'false',
      enableBlacklist: process.env.ENABLE_BLACKLIST !== 'false',
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
        /\\n/g,
        '\n',
      ),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    },
    logger: {
      level:
        (process.env.LOG_LEVEL as EnvironmentConfig['logger']['level']) ||
        (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      directory: process.env.LOG_DIRECTORY || 'logs',
      maxFiles: process.env.LOG_MAX_FILES || '30d',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
    },
  };

  validateEnvVariables(config);

  return config;
};
