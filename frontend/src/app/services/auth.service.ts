import { Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = new Keycloak({
    url: 'http://localhost:8095',
    realm: 'demo-realm',
    clientId: 'distribution-app',
  });

  readonly isAuthenticated = signal(false);
  readonly username = signal<string>('');
  readonly roles = signal<string[]>([]);

  async init(): Promise<void> {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    this.isAuthenticated.set(authenticated);

    if (authenticated) {
      this.username.set(this.keycloak.tokenParsed?.['preferred_username'] ?? '');
      this.roles.set(
        (this.keycloak.tokenParsed?.['realm_access'] as any)?.['roles'] ?? []
      );
    }
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin + '/login' });
  }

  get token(): string | undefined {
    return this.keycloak.token;
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshed = await this.keycloak.updateToken(60);
      if (refreshed) {
        this.username.set(this.keycloak.tokenParsed?.['preferred_username'] ?? '');
      }
    } catch {
      this.login();
    }
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}
