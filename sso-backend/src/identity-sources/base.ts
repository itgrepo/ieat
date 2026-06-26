import { User } from '../models/types';

export interface IdentitySource {
  authenticate(options: any): Promise<any>;
  validateResponse(payload: any): Promise<User>;
  getMetadata(): string;
  handleLogout(userId: string): Promise<void>;
}

// Logic for future expansion
export enum AuthProtocol {
  SAML = 'saml',
  OIDC = 'oidc',
  LDAP = 'ldap'
}
