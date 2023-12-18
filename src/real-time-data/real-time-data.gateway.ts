import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { RealTimeDataService } from './real-time-data.service';
import { CustomValidationPipe } from './decorator/validation-pipe.decorator';

@WebSocketGateway({
  namespace: 'real-time',
})
export class RealTimeDataGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealTimeDataGateway.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly realtimeService: RealTimeDataService,
  ) {}

  @WebSocketServer()
  server: Server;

  private intervalMap = new Map<string, NodeJS.Timeout>();

  afterInit(server: Server) {
    server.disconnectSockets();
  }

  private leaveAllRoomsExceptCurrent(socket: Socket) {
    for (const room of Array.from(socket.rooms)) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnnect called: ${socket.id}`);
    this.stopSendingData(socket);
    socket.rooms.clear();
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
      this.logger.error(e);
      socket.disconnect();
    }
  }

  // 데이터 전송 시작
  private startSendingData(roomId: string, socket: Socket) {
    // const interval = setInterval(async () => {
    //   const dataList = await this.realtimeService.fetchRealTimedata(roomId);
    //   this.server.to(roomId).emit('receive_data', dataList);
    // }, 1000 * 10); // 예시: 10초마다 데이터 전송

    // this.intervalMap.set(socket.id, interval);
    const sendData = async () => {
      const dataList = await this.realtimeService.fetchRealTimedata(roomId);
      this.server.to(roomId).emit('receive_data', dataList);

      // 다음 전송 예약
      const interval = setTimeout(sendData, 1000 * 10); // 10초 후 다시 호출
      this.intervalMap.set(socket.id, interval);
    };

    sendData();
  }

  // 데이터 전송 중지
  private stopSendingData(socket: Socket) {
    let interval = this.intervalMap.get(socket.id);

    if (interval) {
      clearInterval(interval);
      this.intervalMap.delete(socket.id);
    }
  }

  // --------------------------------------------------------------------
  @UsePipes(CustomValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 로직 흐름 룸 아이디를 받아서 현재 기기에서
    const { roomId } = data;
    console.log(roomId);

    this.leaveAllRoomsExceptCurrent(socket);
    socket.join(roomId);
    this.startSendingData(roomId, socket);
  }

  @UsePipes(CustomValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const { roomId } = data;
    this.leaveAllRoomsExceptCurrent(socket);
    socket.leave(roomId);
    this.stopSendingData(socket);
    this.handleDisconnect(socket);
  } //

  // 데이터 전송 일시중지
  @UsePipes(CustomValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('pauseSendingData')
  handlePauseSendingData(@ConnectedSocket() socket: Socket) {
    this.stopSendingData(socket);
  }

  // 데이터 전송 재개
  @UsePipes(CustomValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('resumeSendingData')
  handleResumeSendingData(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    this.startSendingData(roomId, socket);
  }
}
