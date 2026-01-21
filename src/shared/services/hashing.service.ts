import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class HashingService {
  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, BCRYPT_SALT_ROUNDS);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(data, hash);
  }
}
