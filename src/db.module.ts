import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from './shared/consts';

const dbProvider = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
