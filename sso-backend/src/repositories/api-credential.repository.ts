import { BaseRepository } from './base.repository';

export interface ApiCredential {
  id: string; // credential_id
  service_id: string;
  user_id: string;
  secret_key: string;
  status: 'active' | 'revoked';
  expires_at?: string | null;
  created_at: string;
  scope_json?: any;
}

export class ApiCredentialRepository extends BaseRepository<ApiCredential> {
  constructor() {
    super('api_credentials.json');
  }

  async getByServiceId(serviceId: string): Promise<ApiCredential[]> {
    const all = await this.getAll();
    return all.filter(item => item.service_id === serviceId);
  }
}

export const apiCredentialRepository = new ApiCredentialRepository();
