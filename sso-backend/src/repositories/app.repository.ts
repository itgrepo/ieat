import { BaseRepository } from './base.repository';

export interface Application {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  accent: string;
  tags: string[];
}

export class AppRepository extends BaseRepository<Application> {
  constructor() {
    super('applications.json');
  }
}
