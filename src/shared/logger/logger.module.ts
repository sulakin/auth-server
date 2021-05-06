import { DynamicModule, Module } from '@nestjs/common';
import { LoggerOptions } from 'winston';
import { LoggerService } from './logger.service';
import { LOGGER_CONFIG_OPTIONS } from '../consts';

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_CONFIG_OPTIONS,
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
