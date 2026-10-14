import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 5000;

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  DB_DATABASE!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  POSTGRES_USER?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  POSTGRES_PASSWORD?: string;

  @IsString()
  KEYCLOAK_AUTH_SERVER_URL!: string;

  @IsString()
  KEYCLOAK_REALM!: string;

  @IsString()
  KEYCLOAK_CLIENT_ID!: string;

  @IsString()
  KEYCLOAK_CLIENT_SECRET!: string;
}

const INSECURE_DEFAULT_PASSWORDS = [
  'postgres',
  'admin',
  'password',
  '123456',
  'root',
  'backend-secret',
];

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  // Normalize DB_USERNAME/DB_PASSWORD and POSTGRES_USER/POSTGRES_PASSWORD
  const normalizedConfig: Record<string, unknown> = { ...config };
  const user = normalizedConfig.DB_USERNAME || normalizedConfig.POSTGRES_USER || 'postgres';
  const pass = normalizedConfig.DB_PASSWORD || normalizedConfig.POSTGRES_PASSWORD || 'postgres';
  normalizedConfig.DB_USERNAME = user;
  normalizedConfig.POSTGRES_USER = user;
  normalizedConfig.DB_PASSWORD = pass;
  normalizedConfig.POSTGRES_PASSWORD = pass;

  const validatedConfig = plainToInstance(EnvironmentVariables, normalizedConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `[EnvValidation] Environment configuration error: ${errors.toString()}`,
    );
  }

  // Production Security Guard: Reject weak/default passwords in production
  if (validatedConfig.NODE_ENV === Environment.Production) {
    const effectiveDbPassword = (validatedConfig.DB_PASSWORD || '').toLowerCase();
    const isDbPasswordWeak = INSECURE_DEFAULT_PASSWORDS.includes(effectiveDbPassword);
    const isClientSecretWeak = INSECURE_DEFAULT_PASSWORDS.includes(
      validatedConfig.KEYCLOAK_CLIENT_SECRET.toLowerCase(),
    );

    if (isDbPasswordWeak || effectiveDbPassword.length < 12) {
      throw new Error(
        '[SecurityGuard] FATAL: Production environment detected with insecure or weak DB_PASSWORD/POSTGRES_PASSWORD! Must be at least 12 high-entropy characters.',
      );
    }

    if (
      isClientSecretWeak ||
      validatedConfig.KEYCLOAK_CLIENT_SECRET.length < 16
    ) {
      throw new Error(
        '[SecurityGuard] FATAL: Production environment detected with insecure KEYCLOAK_CLIENT_SECRET! Must be at least 16 characters.',
      );
    }
  }

  return validatedConfig;
}
