// Environment Configuration
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  host: string;

  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;
  redisPassword?: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;

  // API Keys
  openaiApiKey: string;
  assemblyaiApiKey: string;
  elevenlabsApiKey: string;

  // CORS
  corsOrigin: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // File Upload
  maxFileSize: number;
  uploadDir: string;

  // Storage
  storageType: 'local' | 's3';
  s3Endpoint?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Bucket?: string;
  s3Region?: string;

  // Logging
  logLevel: string;
  logDir: string;

  // Email
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  emailFrom?: string;

  // Analytics
  enableAnalytics: boolean;
  analyticsBatchSize: number;

  // WebSocket
  wsPingInterval: number;
  wsPingTimeout: number;
}

function validateEnv(): Config {
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    redisPassword: process.env.REDIS_PASSWORD,

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

    // API Keys
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    assemblyaiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',

    // Storage
    storageType: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
    s3Endpoint: process.env.S3_ENDPOINT,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logDir: process.env.LOG_DIR || './logs',

    // Email
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    emailFrom: process.env.EMAIL_FROM,

    // Analytics
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    analyticsBatchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '100', 10),

    // WebSocket
    wsPingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000', 10),
    wsPingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000', 10),
  };
}

export const config = validateEnv();

export default config;
