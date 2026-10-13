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
  POSTGRES_USER!: string;

  @IsString()
  @MinLength(4)
  POSTGRES_PASSWORD!: string;

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
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
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
    const isDbPasswordWeak = INSECURE_DEFAULT_PASSWORDS.includes(
      validatedConfig.POSTGRES_PASSWORD.toLowerCase(),
    );
    const isClientSecretWeak = INSECURE_DEFAULT_PASSWORDS.includes(
      validatedConfig.KEYCLOAK_CLIENT_SECRET.toLowerCase(),
    );

    if (isDbPasswordWeak || validatedConfig.POSTGRES_PASSWORD.length < 12) {
      throw new Error(
        '[SecurityGuard] FATAL: Production environment detected with insecure or weak POSTGRES_PASSWORD! Must be at least 12 high-entropy characters.',
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
