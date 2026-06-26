import { BaseRepository } from './base.repository';
import { UserIdentityMapping } from '../models/types';

export class IdentityMappingRepository extends BaseRepository<UserIdentityMapping> {
  constructor() {
    super('identity_mappings.json');
  }

  async findByExternalId(providerId: string, externalId: string): Promise<UserIdentityMapping | undefined> {
    const all = await this.getAll();
    return all.find(m => m.providerId === providerId && m.externalId === externalId);
  }
}
