import { Module } from '@nestjs/common';
import { DbModule } from './db.module';
import { ApiModule } from './api.module';

@Module({
  imports: [DbModule, ApiModule],
})
export class AppModule {}
