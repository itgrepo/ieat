"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProtocol = void 0;
// Logic for future expansion
var AuthProtocol;
(function (AuthProtocol) {
    AuthProtocol["SAML"] = "saml";
    AuthProtocol["OIDC"] = "oidc";
    AuthProtocol["LDAP"] = "ldap";
})(AuthProtocol || (exports.AuthProtocol = AuthProtocol = {}));
