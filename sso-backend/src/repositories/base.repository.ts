import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export class BaseRepository<T extends { id: string }> {
  protected filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  async getAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getById(id: string): Promise<T | undefined> {
    const all = await this.getAll();
    return all.find(item => item.id === id);
  }

  async create(item: T): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }

      const all = await this.getAll();
      all.push(item);
      await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    } catch (error) {
      console.error(`[BaseRepository] Create failed for ${this.filePath}:`, error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates } as T;
      await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    }
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(item => item.id !== id);
    await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
  }
}
