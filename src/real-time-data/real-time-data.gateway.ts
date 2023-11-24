import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception-filter';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { GatewaysService } from '../gateways/gateways.service';
import { RealTimeDataService } from './real-time-data.service';

@WebSocketGateway({
  namespace: 'real-time',
})
export class RealTimeDataGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly realtimeService: RealTimeDataService,
    private readonly gatewaysService: GatewaysService,
  ) {}

  @WebSocketServer()
  server: Server;

  private intervalMap = new Map<string, NodeJS.Timeout>();

  afterInit(server: any) {
    console.log('after gateway init');
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnnect called: ${socket.id}`);
    this.stopSendingData(socket);
    for (const room of Array.from(socket.rooms)) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);

    const headers = socket.handshake.headers;

    // Bearer a389dfgk49k~~~~
    const rawToken = headers['authorization'];
    console.log(rawToken);
    if (!rawToken) {
      socket.disconnect();
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      console.log(token);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (e) {
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 로직 흐름 룸 아이디를 받아서 현재 기기에서
    const { roomId } = data;

    for (const room of Array.from(socket.rooms)) {
      if (room != socket.id) {
        socket.leave(room);
      }
    }
    console.log(roomId);
    socket.join(roomId);
    this.startSendingData(roomId, socket);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const { roomId } = data;
    socket.leave(roomId);
    this.stopSendingData(socket);
  }

  // @SubscribeMessage('send_message')
  // sendMessage(
  //   @MessageBody() message: { message: string; gatewayId: string },
  //   @ConnectedSocket() socket: Socket & { user: UsersModel },
  // ) {
  //   console.log(message);
  //   this.server.in(message.gatewayId).emit('receive_message', message.message);
  // }

  @SubscribeMessage('pauseSendingData')
  handlePauseSendingData(@ConnectedSocket() socket: Socket) {
    this.stopSendingData(socket);
  }

  @SubscribeMessage('resumeSendingData')
  handleResumeSendingData(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    this.startSendingData(roomId, socket);
  }

  // 데이터 전송 시작
  private startSendingData(roomId: string, socket: Socket) {
    const interval = setInterval(async () => {
      const dataList = await this.realtimeService.fetchRealTimedata(roomId);
      this.server.to(roomId).emit('receive_data', dataList);
    }, 1000 * 10); // 예시: 10초마다 데이터 전송

    this.intervalMap.set(socket.id, interval);
  }

  // 데이터 전송 중지
  private stopSendingData(socket: Socket) {
    let interval = this.intervalMap.get(socket.id);

    if (interval) {
      clearInterval(interval);
      this.intervalMap.delete(socket.id);
    }
  }
}
