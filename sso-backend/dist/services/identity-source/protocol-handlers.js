"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPHandler = exports.OIDCHandler = exports.SAMLHandler = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const handler_1 = require("./handler");
class SAMLHandler extends handler_1.IdentitySourceHandler {
    async testConnection(config) {
        // Basic SAML config validation
        // In production-ready version, we prioritize EntityID and SSO URL
        const required = ['entityId', 'ssoUrl', 'certificate'];
        const missing = required.filter(f => !config[f]);
        if (missing.length > 0) {
            return { status: 'error', message: `Missing required technical fields: ${missing.join(', ')}` };
        }
        return { status: 'ok', message: 'SAML configuration structure is technically valid' };
    }
    async parseMetadata(xml) {
        try {
            const xmlStr = xml.toString();
            const parser = new fast_xml_parser_1.XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_',
                removeNSPrefix: true
            });
            const jsonObj = parser.parse(xmlStr);
            const entityDescriptor = jsonObj.EntityDescriptor;
            if (!entityDescriptor) {
                return { error: 'Invalid SAML Metadata: EntityDescriptor not found' };
            }
            const entityId = entityDescriptor['@_entityID'];
            const idpDescriptor = entityDescriptor.IDPSSODescriptor;
            if (!idpDescriptor) {
                return { error: 'Invalid SAML Metadata: IDPSSODescriptor not found' };
            }
            // Extract SSO URL (prefer HTTP-Redirect)
            let ssoUrl = '';
            const ssoServices = Array.isArray(idpDescriptor.SingleSignOnService)
                ? idpDescriptor.SingleSignOnService
                : [idpDescriptor.SingleSignOnService];
            const redirectSso = ssoServices.find((s) => s['@_Binding']?.includes('HTTP-Redirect'));
            const postSso = ssoServices.find((s) => s['@_Binding']?.includes('HTTP-POST'));
            ssoUrl = (redirectSso || postSso || ssoServices[0])?.['@_Location'] || '';
            // Extract SLO URL
            let sloUrl = '';
            if (idpDescriptor.SingleLogoutService) {
                const sloServices = Array.isArray(idpDescriptor.SingleLogoutService)
                    ? idpDescriptor.SingleLogoutService
                    : [idpDescriptor.SingleLogoutService];
                const redirectSlo = sloServices.find((s) => s['@_Binding']?.includes('HTTP-Redirect'));
                sloUrl = (redirectSlo || sloServices[0])?.['@_Location'] || '';
            }
            // Extract Certificate
            let certificate = '';
            const keyDescriptors = Array.isArray(idpDescriptor.KeyDescriptor)
                ? idpDescriptor.KeyDescriptor
                : [idpDescriptor.KeyDescriptor];
            const signingKey = keyDescriptors.find((k) => k['@_use'] === 'signing') || keyDescriptors[0];
            if (signingKey?.KeyInfo?.X509Data?.X509Certificate) {
                certificate = signingKey.KeyInfo.X509Data.X509Certificate;
            }
            // Extract NameID Format
            let nameIdFormat = '';
            if (idpDescriptor.NameIDFormat) {
                nameIdFormat = Array.isArray(idpDescriptor.NameIDFormat)
                    ? idpDescriptor.NameIDFormat[0]
                    : idpDescriptor.NameIDFormat;
            }
            return {
                entityId,
                ssoUrl,
                sloUrl,
                certificate: certificate.trim().replace(/\s+/g, ''),
                nameIdFormat
            };
        }
        catch (err) {
            return { error: `Failed to parse XML: ${err.message}` };
        }
    }
}
exports.SAMLHandler = SAMLHandler;
class OIDCHandler extends handler_1.IdentitySourceHandler {
    async testConnection(config) {
        const required = ['issuer', 'clientId', 'clientSecret'];
        const missing = required.filter(f => !config[f]);
        if (missing.length > 0) {
            return { status: 'error', message: `Missing required OIDC fields: ${missing.join(', ')}` };
        }
        try {
            const discoveryUrl = config.issuer.endsWith('/')
                ? `${config.issuer}.well-known/openid-configuration`
                : `${config.issuer}/.well-known/openid-configuration`;
            const response = await fetch(discoveryUrl);
            if (!response.ok) {
                return { status: 'error', message: `Failed to reach OIDC Discovery URL: ${response.statusText}` };
            }
            const data = await response.json();
            if (!data.issuer || !data.authorization_endpoint) {
                return { status: 'error', message: 'Invalid OIDC Discovery response: Missing issuer or endpoints' };
            }
            return { status: 'ok', message: `Connected to ${data.issuer} successfully` };
        }
        catch (err) {
            return { status: 'error', message: `OIDC Connectivity failed: ${err.message}` };
        }
    }
    async parseDiscovery(url) {
        try {
            const discoveryUrl = url.includes('.well-known')
                ? url
                : (url.endsWith('/') ? `${url}.well-known/openid-configuration` : `${url}/.well-known/openid-configuration`);
            const response = await fetch(discoveryUrl);
            if (!response.ok)
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            return {
                issuer: data.issuer,
                authorizationUrl: data.authorization_endpoint,
                tokenUrl: data.token_endpoint,
                userInfoUrl: data.userinfo_endpoint,
                jwksUri: data.jwks_uri,
                responseTypes: data.response_types_supported
            };
        }
        catch (err) {
            return { error: `OIDC Discovery failed: ${err.message}` };
        }
    }
}
exports.OIDCHandler = OIDCHandler;
class LDAPHandler extends handler_1.IdentitySourceHandler {
    async testConnection(config) {
        return { status: 'ok', message: 'AD/LDAP Placeholder: Connection test logic to be implemented' };
    }
}
exports.LDAPHandler = LDAPHandler;
