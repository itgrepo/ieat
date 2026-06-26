import { SAML } from '@node-saml/node-saml';
import { IdentitySource, SAMLConfig } from '../types/identity-source';
import { User } from '../models/types';
import { AttributeMapper } from '../mappings/attribute-mapper';
import { UserService } from '../services/user.service';

export class SAMLService {
  private saml: SAML;
  private source: IdentitySource;
  private userService = new UserService();

  constructor(source: IdentitySource) {
    this.source = source;
    const config = source.config as SAMLConfig;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // SP Information - Use stored value or fallback to standard pattern
    const acsUrl = config.spAcsUrl || `${baseUrl}/auth/saml/${source.sourceKey}/callback`;
    const entityId = config.spEntityId || `${baseUrl}/auth/saml/${source.sourceKey}/metadata`;
    const logoutUrl = config.spSloUrl || `${baseUrl}/auth/saml/${source.sourceKey}/logout/callback`;

    this.saml = new SAML({
      callbackUrl: acsUrl,
      entryPoint: config.ssoUrl,
      issuer: entityId,
      idpCert: config.certificate,
      logoutCallbackUrl: logoutUrl,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256',
      wantAssertionsSigned: config.wantAssertionsSigned ?? true,
      identifierFormat: config.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
    });
  }

  async generateAuthorizeUrl(): Promise<string> {
    return await this.saml.getAuthorizeUrlAsync('', '', {});
  }

  async validateResponse(body: any): Promise<User> {
    try {
      const { profile } = await this.saml.validatePostResponseAsync(body);
      
      if (!profile) throw new Error('Invalid SAML profile');

      // Map attributes
      const mappedUser = AttributeMapper.map(profile, this.source.mapping);
      
      // Perform Just-In-Time (JIT) Provisioning
      const user = await this.userService.provisionUser(
        {
          username: mappedUser.username || (profile.nameID as string),
          email: mappedUser.email || (profile.email as string) || '',
          fullName: mappedUser.fullName || (profile.displayName as string) || '',
          department: mappedUser.department || 'Internal',
          role: mappedUser.role || 'User'
        },
        this.source.id,
        profile.nameID as string
      );

      return user;
    } catch (error) {
      console.error('SAML Validation Error:', error);
      throw error;
    }
  }

  getMetadata(): string {
    return this.saml.generateServiceProviderMetadata(null, null);
  }
}
