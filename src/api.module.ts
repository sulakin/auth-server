import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { HttpErrorFilter } from './shared/http-error.filter';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
  exports: [UsersModule],
})
export class ApiModule {}
