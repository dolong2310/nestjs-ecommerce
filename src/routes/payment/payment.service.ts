import { PaymentRepository } from '@/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { generateRoomUserId } from '@/shared/helpers';
// import { SharedWebSocketRepository } from '@/shared/repositories/shared-websocket.repo';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly paymentRepository: PaymentRepository,
    // private readonly sharedWebSocketRepository: SharedWebSocketRepository,
  ) {}

  async receiver(props: { body: WebhookPaymentBodyType }): Promise<MessageResponseType> {
    // 1. Callback receiver payment from Sepay
    const userId = await this.paymentRepository.receiver(props);

    // Cách 1:
    // // 2. Find all web sockets of user and emit event payment successful to client
    // const webSockets = await this.sharedWebSocketRepository.findMany(userId).catch(() => []);
    // webSockets.forEach((webSocket) => {
    //   // Response for client
    //   this.server.to(webSocket.id).emit('payment', { message: 'Payment successful' });
    // });

    // Cách 2: Sử dụng tính năng "Room" của socket.io => emit event tới room chứa các userId đã được join ở websocket.adpater.ts
    this.server.to(generateRoomUserId(userId)).emit('payment', { message: 'Payment successful' });

    // 3. Return message response (response for Sepay)
    return { message: 'Payment successful' };
  }
}
