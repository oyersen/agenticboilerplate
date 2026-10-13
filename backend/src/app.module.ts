import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppKeycloakModule } from './core/auth/keycloak.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validateEnvironment } from './core/config/env.validation';
import { SystemSettingsModule } from './core/settings/system-settings.module';
import { FeaturesModule } from './core/features/features.module';
import { FeatureFlagGuard } from './core/features/guards/feature-flag.guard';
import { AuditLogModule } from './core/audit/audit-log.module';
import { AppQueueModule } from './core/queue/queue.module';
import { EventsModule } from './core/events/events.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 1. Central Configuration (.env) with strict validation & security guard
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      validate: validateEnvironment,
    }),

    // 2. PostgreSQL with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'app_db'),
        autoLoadEntities: true,
        synchronize: false, // Production safety: schema managed via migrations
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 3. Keycloak IAM Integration
    AppKeycloakModule,

    // 4. Rate Limiting (Security Guard)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // 5. Enterprise Core Foundation
    SystemSettingsModule,
    FeaturesModule,
    AuditLogModule,
    AppQueueModule,
    EventsModule,

    // 6. Default Health Check
    HealthModule,
  ],
  providers: [
    // Global Rate Limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Dynamic Feature Flag enforcement
    {
      provide: APP_GUARD,
      useClass: FeatureFlagGuard,
    },
  ],
})
export class AppModule {}
