import { BaseRepository } from './base.repository';
import { IdentitySource } from '../types/identity-source';

export class ProviderRepository extends BaseRepository<IdentitySource> {
  constructor() {
    super('identity_sources.json');
  }
}
