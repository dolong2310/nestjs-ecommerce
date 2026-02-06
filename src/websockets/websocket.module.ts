import { ChatGateway } from '@/websockets/chat.gateway';
import { PaymentGateway } from '@/websockets/payment.gateway';
import { Module } from '@nestjs/common';

@Module({
  providers: [ChatGateway, PaymentGateway],
})
export class WebsocketModule {}
