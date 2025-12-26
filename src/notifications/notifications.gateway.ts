import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for now, configure strictly for prod
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // You could handle auth here if needed, extracting token from query/headers
    // const token = client.handshake.auth.token;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Method to send notifications to specific user (client should join room 'user_USERID')
  sendToUser(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(`user_${userId}`);
    this.logger.log(`Client ${client.id} joined room user_${userId}`);
    return { event: 'joinedRoom', data: userId };
  }
}
