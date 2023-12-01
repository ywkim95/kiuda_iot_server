import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import wlogger from 'src/log/winston-logger.const';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const logFormat = `Method: ${request.method} | URL: ${request.url} | IP: ${request.ip} | Status: ${status} | Error Message: ${exception.message}`;

    wlogger.error(logFormat);

    // 로그 파일을 생성하거나
    // 에러 모니터링 시스템에 API 콜 하기

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    });
  }
}
