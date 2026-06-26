import { IdentitySource, ProtocolType } from '../../types/identity-source';
import { AttributeMapper } from '../../mappings/attribute-mapper';

export interface MetadataResult {
  // SAML fields
  entityId?: string;
  ssoUrl?: string;
  sloUrl?: string;
  certificate?: string;
  nameIdFormat?: string;
  
  // OIDC fields
  issuer?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUri?: string;
  
  error?: string;
}

export abstract class IdentitySourceHandler {
  abstract testConnection(config: any): Promise<{ status: 'ok' | 'error', message: string }>;
  
  async parseMetadata(input: string | Buffer): Promise<MetadataResult> {
    return { error: 'Metadata parsing not supported for this protocol' };
  }

  async parseDiscovery(url: string): Promise<MetadataResult> {
    return { error: 'Discovery fetch not supported for this protocol' };
  }

  testMapping(assertions: any, mapping: Record<string, string>) {
    return AttributeMapper.map(assertions, mapping);
  }
}
