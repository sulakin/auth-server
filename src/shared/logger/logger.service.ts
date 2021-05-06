import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { createLogger, LoggerOptions, Logger as WinstonLogger } from 'winston';
import { LOGGER_CONFIG_OPTIONS } from '../consts';
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private logger: WinstonLogger;

  constructor(@Inject(LOGGER_CONFIG_OPTIONS) config: LoggerOptions) {
    super();
    this.logger = createLogger(config);
  }

  setContext(serviceName: string) {
    this.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      service: serviceName,
    };
  }

  appendDefaultMeta(key: string, value: string) {
    this.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      [key]: value,
    };
  }

  log(message: string) {
    this.logger.info(message);
  }
  error(message: string) {
    this.logger.error(message);
  }
  warn(message: string) {
    this.logger.warn(message);
  }
  debug(message: string) {
    this.logger.debug(message);
  }
  verbose(message: string) {
    this.logger.verbose(message);
  }
}
