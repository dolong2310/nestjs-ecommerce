import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'payment' })
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send-message')
  handleSendMessages(@MessageBody() messageBody: any) {
    console.log('messageBody: ', messageBody);
    this.server.emit('receive-message', { data: 'Hello from server' });
  }
}
