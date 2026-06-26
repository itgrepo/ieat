import { BaseRepository } from './base.repository';
import { User } from '../models/types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users.json');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const all = await this.getAll();
    return all.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const all = await this.getAll();
    return all.find(user => user.username === username);
  }
}
