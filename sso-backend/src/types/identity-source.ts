export enum ProtocolType {
  SAML = 'saml',
  OIDC = 'oidc',
  LDAP = 'adldap'
}

export interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: any;
}

export interface IdentitySource {
  id: string;
  sourceKey: string;
  sourceName: string;
  protocolType: ProtocolType;
  displayName: string;
  description?: string;
  status: 'active' | 'inactive';
  readinessStatus: 'draft' | 'configured' | 'ready' | 'error';
  config: any; // Protocol specific config
  mapping: Record<string, string>;
  capabilities: Record<string, boolean>;
  lastTestResult?: TestResult;
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SAMLConfig {
  // IdP Information (Remote)
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  metadataUrl?: string;
  metadataXml?: string;
  certificate: string;
  nameIdFormat?: string;
  wantAssertionsSigned?: boolean;

  // SP Information (Local - for partner exchange)
  spEntityId?: string;
  spAcsUrl?: string;
  spSloUrl?: string;
  spMetadataUrl?: string;
}

export interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;
  jwksUrl?: string;
  redirectUri?: string;
  scope?: string[];
}

export interface LDAPConfig {
  serverUrl: string;
  port: number;
  baseDn: string;
  bindDn: string;
  bindPassword?: string;
  userSearchFilter: string;
  domain?: string;
}
