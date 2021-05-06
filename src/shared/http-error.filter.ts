import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    if (exception.getResponse) {
      const lang = response.req.body.index;
      let messageString: string = exception.getResponse().toString();

      if (messageString.indexOf('%errors%') !== -1) {
        message = messageString
          .split('%errors%')
          .map((error) => error.split('%langs%')[lang])
          .join('. ');
      } else {
        const messageObj =
          messageString.indexOf('%langs%') !== -1
            ? messageString.split('%langs%')
            : exception.getResponse();

        message = messageObj[lang];
      }
    }

    response.status(status).json({ message });
  }
}
