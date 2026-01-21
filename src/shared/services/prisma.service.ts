import { PrismaClient } from '@/generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import envConfig from '../config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // const adapter = new PrismaPg({
    //   connectionString: envConfig.DATABASE_URL,
    // });
    // super({ adapter, log: ['info'] });

    const pool = new Pool({
      connectionString: envConfig.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter, log: ['info', 'warn', 'error'] });
  }
}