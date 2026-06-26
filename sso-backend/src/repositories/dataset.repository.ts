import { BaseRepository } from './base.repository';
import { Dataset } from '../models/types';

export class DatasetRepository extends BaseRepository<Dataset> {
  constructor() {
    super('datasets.json');
  }

  async getByDatasetId(datasetId: string): Promise<Dataset | undefined> {
    const all = await this.getAll();
    return all.find(item => item.datasetId === datasetId);
  }
}

export const datasetRepository = new DatasetRepository();
