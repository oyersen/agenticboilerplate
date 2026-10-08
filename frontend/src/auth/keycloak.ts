import Keycloak from 'keycloak-js';

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:80/auth';
const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'app-realm';
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-client';

export const keycloak = new Keycloak({
  url: keycloakUrl,
  realm,
  clientId,
});
