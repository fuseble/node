import bcrypt from 'bcrypt';
import Crypto from 'crypto-js';
import type { Encrypt as Types } from './types';

export interface EncryptOptions {
  aesKey?: string;
  bcryptSalt?: number;
}

export class Encrypt {
  private aesKey?: string;
  private saltRound?: number;

  constructor(options: EncryptOptions) {
    Object.assign(this, options);
  }

  async hash(value: string, saltRound?: number): Promise<string | null> {
    if (!this.saltRound && !saltRound) {
      return null;
    }

    return await bcrypt.hash(value, (this.saltRound || saltRound) as number);
  }
}
