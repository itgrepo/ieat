import axios from 'axios';
import { ProviderRepository } from '../../repositories/provider.repository';
import { IdentitySource, ProtocolType } from '../../types/identity-source';
import { SAMLHandler, OIDCHandler, LDAPHandler } from './protocol-handlers';
import { IdentitySourceHandler, MetadataResult } from './handler';

export class IdentitySourceService {
  private repo = new ProviderRepository();
  private handlers: Record<ProtocolType, IdentitySourceHandler> = {
    [ProtocolType.SAML]: new SAMLHandler(),
    [ProtocolType.OIDC]: new OIDCHandler(),
    [ProtocolType.LDAP]: new LDAPHandler()
  };

  async getAll() {
    return this.repo.getAll();
  }

  async getById(id: string) {
    return this.repo.getById(id);
  }

  async create(data: Omit<IdentitySource, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const source: IdentitySource = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      readinessStatus: data.readinessStatus || 'draft',
      createdAt: now,
      updatedAt: now
    };
    return this.repo.create(source);
  }

  async update(id: string, data: Partial<IdentitySource>) {
    return this.repo.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  async fetchAndParseMetadata(protocol: ProtocolType, source: { url?: string, xml?: string }): Promise<MetadataResult> {
    const handler = this.handlers[protocol];
    
    if (protocol === ProtocolType.OIDC && source.url) {
      return handler.parseDiscovery(source.url);
    }

    let xmlContent = source.xml || '';
    if (source.url && !xmlContent) {
      try {
        const response = await axios.get(source.url, { timeout: 5000 });
        xmlContent = response.data;
      } catch (err: any) {
        return { error: `Failed to fetch metadata from URL: ${err.message}` };
      }
    }

    if (!xmlContent) return { error: 'No metadata source provided' };
    return handler.parseMetadata(xmlContent);
  }

  async getSPSummary(id: string) {
    const source = await this.repo.getById(id);
    if (!source) throw new Error('Source not found');
    if (source.protocolType !== ProtocolType.SAML) throw new Error('Not a SAML source');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const sourceKey = source.sourceKey;

    return {
      spEntityId: `${baseUrl}/auth/saml/${sourceKey}/metadata`,
      spAcsUrl: `${baseUrl}/auth/saml/${sourceKey}/callback`,
      spSloUrl: `${baseUrl}/auth/saml/${sourceKey}/logout/callback`,
      spMetadataUrl: `${baseUrl}/auth/saml/${sourceKey}/metadata`
    };
  }

  async getSPMetadata(id: string): Promise<string> {
    const summary = await this.getSPSummary(id);
    const source = await this.repo.getById(id);
    
    // Simple SP Metadata Generator
    return `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${summary.spEntityId}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${summary.spAcsUrl}" index="1"/>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${summary.spSloUrl}"/>
  </SPSSODescriptor>
</EntityDescriptor>`;
  }

  async testConnection(id: string) {
    const source = await this.repo.getById(id);
    if (!source) throw new Error('Source not found');
    
    const handler = this.handlers[source.protocolType];
    const result = await handler.testConnection(source.config);
    
    // Update status based on test
    const readinessStatus = result.status === 'ok' ? 'ready' : 'error';
    await this.update(id, { 
      readinessStatus,
      lastTestedAt: new Date().toISOString(),
      lastTestResult: {
        success: result.status === 'ok',
        message: result.message,
        timestamp: new Date().toISOString()
      }
    });

    return result;
  }

  async testMapping(id: string, assertions: any) {
    const source = await this.repo.getById(id);
    if (!source) throw new Error('Source not found');
    
    const handler = this.handlers[source.protocolType];
    return handler.testMapping(assertions, source.mapping);
  }
}
