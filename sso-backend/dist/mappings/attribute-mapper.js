"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeMapper = void 0;
class AttributeMapper {
    static map(assertions, mapping) {
        const user = {};
        // Default system fields mapping
        const systemFields = ['username', 'email', 'fullName', 'department', 'role', 'employeeId', 'citizenId'];
        for (const field of systemFields) {
            const samlAttr = mapping[field];
            if (samlAttr && assertions[samlAttr]) {
                user[field] = assertions[samlAttr];
            }
        }
        // Fallback: If no email from SAML, try to use a default or placeholder
        if (!user.email && assertions.nameID) {
            user.email = assertions.nameID; // Often the NameID is the email
        }
        return user;
    }
}
exports.AttributeMapper = AttributeMapper;
