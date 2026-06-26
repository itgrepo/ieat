"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentitySourceService = void 0;
const axios_1 = __importDefault(require("axios"));
const provider_repository_1 = require("../../repositories/provider.repository");
const identity_source_1 = require("../../types/identity-source");
const protocol_handlers_1 = require("./protocol-handlers");
class IdentitySourceService {
    constructor() {
        this.repo = new provider_repository_1.ProviderRepository();
        this.handlers = {
            [identity_source_1.ProtocolType.SAML]: new protocol_handlers_1.SAMLHandler(),
            [identity_source_1.ProtocolType.OIDC]: new protocol_handlers_1.OIDCHandler(),
            [identity_source_1.ProtocolType.LDAP]: new protocol_handlers_1.LDAPHandler()
        };
    }
    async getAll() {
        return this.repo.getAll();
    }
    async getById(id) {
        return this.repo.getById(id);
    }
    async create(data) {
        const now = new Date().toISOString();
        const source = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            readinessStatus: data.readinessStatus || 'draft',
            createdAt: now,
            updatedAt: now
        };
        return this.repo.create(source);
    }
    async update(id, data) {
        return this.repo.update(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    }
    async fetchAndParseMetadata(protocol, source) {
        const handler = this.handlers[protocol];
        if (protocol === identity_source_1.ProtocolType.OIDC && source.url) {
            return handler.parseDiscovery(source.url);
        }
        let xmlContent = source.xml || '';
        if (source.url && !xmlContent) {
            try {
                const response = await axios_1.default.get(source.url, { timeout: 5000 });
                xmlContent = response.data;
            }
            catch (err) {
                return { error: `Failed to fetch metadata from URL: ${err.message}` };
            }
        }
        if (!xmlContent)
            return { error: 'No metadata source provided' };
        return handler.parseMetadata(xmlContent);
    }
    async getSPSummary(id) {
        const source = await this.repo.getById(id);
        if (!source)
            throw new Error('Source not found');
        if (source.protocolType !== identity_source_1.ProtocolType.SAML)
            throw new Error('Not a SAML source');
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const sourceKey = source.sourceKey;
        return {
            spEntityId: `${baseUrl}/auth/saml/${sourceKey}/metadata`,
            spAcsUrl: `${baseUrl}/auth/saml/${sourceKey}/callback`,
            spSloUrl: `${baseUrl}/auth/saml/${sourceKey}/logout/callback`,
            spMetadataUrl: `${baseUrl}/auth/saml/${sourceKey}/metadata`
        };
    }
    async getSPMetadata(id) {
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
    async testConnection(id) {
        const source = await this.repo.getById(id);
        if (!source)
            throw new Error('Source not found');
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
    async testMapping(id, assertions) {
        const source = await this.repo.getById(id);
        if (!source)
            throw new Error('Source not found');
        const handler = this.handlers[source.protocolType];
        return handler.testMapping(assertions, source.mapping);
    }
}
exports.IdentitySourceService = IdentitySourceService;
