import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import wlogger from 'src/log/winston-logger.const';

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    const logMessage = `WebSocket Exception: ${exception.message} | Client ID: ${socket.id}`;

    wlogger.error(logMessage);

    socket.emit('exception', {
      data: exception.getResponse(),
    });
  }
}
