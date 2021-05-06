import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LangInterceptor implements NestInterceptor<any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const langs = process.env.LANGS.split(',');
    const lang: string = request.headers['accept-language'] || langs[0];
    const index: number = ((i) => (i !== -1 ? i : 0))(
      langs.indexOf(lang.toLowerCase().slice(0, 2)),
    );

    request.body.index = index;
    request.body.lang = langs[index];

    return next.handle().pipe(
      map((data) => {
        if (typeof data.message === 'object') {
          const message: string = data.message[index];
          return { ...data, message };
        }

        return data;
      }),
    );
  }
}
