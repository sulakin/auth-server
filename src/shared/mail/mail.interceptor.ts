import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { readFileSync } from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

const logger = new Logger('MailInterceptor');

@Injectable()
export class MailInterceptor implements NestInterceptor<any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(async (data) => {
        if (data.mailer) {
          const { lang, index } = request.body;
          const { email, subject, template, params } = data.mailer;
          const htmlTemplate = await this.readTemplate(template, lang);
          const message = await this.fillTemplate(htmlTemplate, params);
          this.sendMail(email, subject[index], message);

          delete data.mailer;
        }

        return data;
      }),
    );
  }

  async sendMail(email: string, subject: Array<string>, message: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT),
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.MAILER_USER,
      to: email,
      subject: subject,
      html: message,
    });

    if (info.response.indexOf('OK') !== -1) {
      logger.log(`Message sent to ${info.accepted[0]}, id: ${info.messageId}`);
      return true;
    }

    logger.log(
      `Error message sent to ${info.accepted[0]}, id: ${info.messageId}`,
    );
    return false;
  }

  readTemplate = (template: string, language: string) => {
    return readFileSync(
      path.join('email_templates', `${template}_${language}.html`),
      'utf8',
    );
  };

  fillTemplate = (template: string, params: Array<string>) => {
    return template.replace(/{(.*?)}/g, (param) => params[param.slice(1, -1)]);
  };
}
