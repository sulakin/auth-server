import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '../db.module';
import { format, transports } from 'winston';
import { LoggerModule } from '../shared/logger/logger.module';

const date = new Date().toLocaleDateString('ru-RU');

@Module({
  imports: [
    DbModule,
    LoggerModule.forRoot({
      format: format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.json(),
        format.colorize({ all: true }),
      ),
      transports: [
        new transports.File({
          filename: `./logs/${date}-error.log`,
          level: 'error',
        }),
        new transports.File({
          filename: `./logs/${date}-combined.log`,
        }),
        new transports.Console(),
      ],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
