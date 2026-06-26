import { BaseRepository } from './base.repository';

export interface PmisUser {
  id: string; // BaseRepository requires id: string, we'll convert numeric id to string in repository
  created_at: string;
  updated_at: string;
  email: string;
  password?: string;
  enabled: number;
  refresh_token: string | null;
  status: string;
  password_reset_at: string | null;
  password_expired_at: string | null;
  deleted_at: string | null;
  email_verify_at: string | null;
  password_reset_token: string | null;
  email_verify_token: string | null;
  email_verify_token_expired_at: string | null;
  role_id: number;
  user_type: string;
  username: string;
}

export class PmisRepository extends BaseRepository<PmisUser> {
  constructor() {
    super('pmis_users.json');
  }

  async findByUsername(username: string): Promise<PmisUser | undefined> {
    const all = await this.getAll();
    // Convert DB id to string to satisfy base repository type requirements
    const mapped = all.map(user => ({
      ...user,
      id: String(user.id)
    }));
    return mapped.find(user => user.username === username);
  }

  async findByEmail(email: string): Promise<PmisUser | undefined> {
    const all = await this.getAll();
    const mapped = all.map(user => ({
      ...user,
      id: String(user.id)
    }));
    return mapped.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
}
