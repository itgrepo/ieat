/// <reference types="jest" />
import { AttributeMapper } from '../../src/mappings/attribute-mapper';

describe('AttributeMapper', () => {
  const mapping = {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    fullName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
    role: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
  };

  test('should map all available attributes correctly', () => {
    const assertions = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'test@example.com',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Test User',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department': 'IT',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role': 'Admin'
    };

    const result = AttributeMapper.map(assertions, mapping);

    expect(result.email).toBe('test@example.com');
    expect(result.fullName).toBe('Test User');
    expect(result.department).toBe('IT');
    expect(result.role).toBe('Admin');
  });

  test('should handle missing attributes with partial data', () => {
    const assertions = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'test@example.com'
    };

    const result = AttributeMapper.map(assertions, mapping);

    expect(result.email).toBe('test@example.com');
    expect(result.department).toBeUndefined();
    expect(result.role).toBeUndefined();
  });

  test('should fallback to nameID if email assertion is missing', () => {
    const assertions = {
      nameID: 'fallback@example.com'
    };

    const result = AttributeMapper.map(assertions, mapping);

    expect(result.email).toBe('fallback@example.com');
  });
});
