import { BaseRepository } from './base.repository';
import { Organization } from '../models/types';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super('organizations.json');
  }
}

export const organizationRepository = new OrganizationRepository();
