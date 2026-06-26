export interface SAMLProviderConfig {
  id: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  acsUrl: string;
  metadataUrl?: string;
  metadataXml?: string;
  x509Certificate: string;
  privateKey?: string;
  nameIdFormat?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  wantAssertionsSigned: boolean;
  wantResponseSigned: boolean;
  attributeMapping: Record<string, string>; // e.g. { "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" }
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  department?: string;
  role: string;
  employeeId?: string;
  citizenId?: string;
  status: 'active' | 'inactive';
  firstname?: string;
  lastname?: string;
  usage_objective?: string;
  other_object?: string;
}

export interface UserIdentityMapping {
  id: string; // Internal mapping ID
  userId: string;
  providerId: string;
  externalId: string; // NameID from SAML
  providerType: 'saml' | 'oidc' | 'ldap';
  lastLogin: Date;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Dataset {
  id: string;
  datasetId: string; // e.g. POP-001
  name: string;
  category: string;
  organization: string; // organization name
  accessibility: 'Public' | 'Restricted' | 'Confidential';
  description?: string;
  status: 'Active' | 'Inactive';
  dataFormat?: string; // CSV,JSON,API
  apiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Extra metadata fields
  sub_category?: string;
  contact_name?: string;
  contact_email?: string;
  tags?: string;
  purpose?: string;
  dept_contact?: string;
  update_freq_unit?: string;
  update_freq_value?: number;
  geo_scope?: string;
  data_source?: string;
  gov_category?: string;
  license?: string;
  access_conditions?: string;
  sponsor?: string;
  smallest_unit?: string;
  url?: string;
  languages?: string;
  objective_type?: string;
  external_dashboard_url?: string;
  external_api_url?: string;
  dataset_type?: string;
  file_path?: string;
  api_type?: string;
  api_endpoint?: string;
  api_db_name?: string;
  api_source_type?: string;
  api_source_name?: string;
  api_request_fields?: any;
  api_response_fields?: any;
}

export interface ApiCredential {
  id: string;
  datasetId: string;
  userId: string;
  secretKey: string;
  status: 'active' | 'revoked';
  expiresAt?: Date;
  createdAt: Date;
}

export interface DatasetPermissionRequest {
  id: string;
  datasetId: string;
  userId: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}
