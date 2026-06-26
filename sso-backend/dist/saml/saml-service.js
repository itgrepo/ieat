"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMLService = void 0;
const node_saml_1 = require("@node-saml/node-saml");
const attribute_mapper_1 = require("../mappings/attribute-mapper");
const user_service_1 = require("../services/user.service");
class SAMLService {
    constructor(source) {
        this.userService = new user_service_1.UserService();
        this.source = source;
        const config = source.config;
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        // SP Information - Use stored value or fallback to standard pattern
        const acsUrl = config.spAcsUrl || `${baseUrl}/auth/saml/${source.sourceKey}/callback`;
        const entityId = config.spEntityId || `${baseUrl}/auth/saml/${source.sourceKey}/metadata`;
        const logoutUrl = config.spSloUrl || `${baseUrl}/auth/saml/${source.sourceKey}/logout/callback`;
        this.saml = new node_saml_1.SAML({
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
    async generateAuthorizeUrl() {
        return await this.saml.getAuthorizeUrlAsync('', '', {});
    }
    async validateResponse(body) {
        try {
            const { profile } = await this.saml.validatePostResponseAsync(body);
            if (!profile)
                throw new Error('Invalid SAML profile');
            // Map attributes
            const mappedUser = attribute_mapper_1.AttributeMapper.map(profile, this.source.mapping);
            // Perform Just-In-Time (JIT) Provisioning
            const user = await this.userService.provisionUser({
                username: mappedUser.username || profile.nameID,
                email: mappedUser.email || profile.email || '',
                fullName: mappedUser.fullName || profile.displayName || '',
                department: mappedUser.department || 'Internal',
                role: mappedUser.role || 'User'
            }, this.source.id, profile.nameID);
            return user;
        }
        catch (error) {
            console.error('SAML Validation Error:', error);
            throw error;
        }
    }
    getMetadata() {
        return this.saml.generateServiceProviderMetadata(null, null);
    }
}
exports.SAMLService = SAMLService;
