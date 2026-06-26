import { SAMLProviderConfig, User } from '../models/types';

export class AttributeMapper {
  static map(assertions: any, mapping: Record<string, string>): Partial<User> {
    const user: any = {};
    
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
