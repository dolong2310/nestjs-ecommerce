/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    // console.log('Chat gateway initialized');
  }

  handleConnection(client: Socket) {
    // console.log('Client connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected: ', client.id);
  }

  @SubscribeMessage('send-message')
  handleSendMessages(@MessageBody() messageBody: any) {
    console.log('messageBody: ', messageBody);
    this.server.emit('receive-message', { data: 'Hello from server' });
  }
}
