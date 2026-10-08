import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  KeycloakConnectModule,
  AuthGuard,
  RoleGuard,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.get<string>(
          'KEYCLOAK_AUTH_SERVER_URL',
          'http://localhost:80/auth',
        ),
        realm: configService.get<string>('KEYCLOAK_REALM', 'app-realm'),
        clientId: configService.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'backend-client',
        ),
        secret: configService.get<string>('KEYCLOAK_SECRET', 'backend-secret'),
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.ONLINE,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // 1. Authenticate JWT token
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // 2. Authorize based on @Roles decorator
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class AppKeycloakModule {}
