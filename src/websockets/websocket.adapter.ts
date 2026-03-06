import envConfig from '@/shared/config';
import { generateRoomUserId } from '@/shared/helpers';
import { SharedWebSocketRepository } from '@/shared/repositories/shared-websocket.repo';
import { TokenService } from '@/shared/services/token.service';
import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, ServerOptions, Socket } from 'socket.io';

// const namespaces = ['/', 'payment', 'chat'];

export class WebsocketAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly sharedWebSocketRepository: SharedWebSocketRepository;
  private readonly tokenService: TokenService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.sharedWebSocketRepository = app.get(SharedWebSocketRepository);
    this.tokenService = app.get(TokenService);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: envConfig.REDIS_URL,
      socket: {
        connectTimeout: 30000, // 30 seconds
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max retries reached');
          return Math.min(retries * 50, 2000);
        },
      },
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    }) as Server;

    // Setup Redis Adapter
    // Tại sao dùng redis adapter? tham khảo link: https://socket.io/docs/v4/rooms/#with-multiple-socketio-servers
    // redis adapter giúp chia sẻ các room giữa các server socket.io
    // ví dụ: có 2 server socket.io, mỗi server có 100 user join vào room 'room-user-1'
    // khi user join vào room 'room-user-1' trên server 1, thì user đó sẽ được join vào room 'room-user-1' trên server 2
    // và ngược lại
    // => redis adapter giúp chia sẻ các room giữa các server socket.io
    // => giữa các server có thể emit event tới các room (hiểu đơn giản là sử dụng chung biến Server, Socket)
    server.adapter(this.adapterConstructor);

    // Setup WebSocket Adapter
    // Cách 1:
    // namespaces.forEach((namespace) => {
    //   server.of(namespace).use(this.authMiddleware); // áp dụng cho namespace cụ thể
    // });

    // Cách 2:
    server.use((socket: Socket, next: (error?: any) => void) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {});
    }); // áp dụng cho main namespace (ví dụ: '/', '/admin')
    server.of(/.*/).use((socket: Socket, next: (error?: any) => void) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {});
    }); // áp dụng cho tất cả các namespace (trừ main namespace)

    return server;
  }

  private async authMiddleware(socket: Socket, next: (error?: any) => void) {
    console.log('connected: ', socket.id);
    // 1. Get headers authorization
    const { authorization } = socket.handshake.headers;
    if (!authorization) {
      return next(new Error('Unauthorized'));
    }
    // 2. Get access token from authorization
    const accesToken = authorization.split(' ')[1];
    if (!accesToken) {
      return next(new Error('Unauthorized'));
    }

    try {
      // 3. Decode access token
      const decoded = await this.tokenService.verifyAccessToken(accesToken);
      if (!decoded) {
        return next(new Error('Unauthorized'));
      }
      // Cách 1:
      // // 4. Create web socket connection in database
      // await this.sharedWebSocketRepository.create({
      //   id: socket.id,
      //   userId: decoded.userId,
      // });
      // // 5. Listen on disconnect, delete web socket connection in database
      // socket.on('disconnect', async () => {
      //   await this.sharedWebSocketRepository.delete(socket.id).catch(() => {});
      // });

      // Cách 2: sử dụng tính năng "Room" của socket.io => tối ưu hơn => không phụ thuộc database
      await socket.join(generateRoomUserId(decoded.userId));

      // 6. Next
      next();
    } catch (error) {
      next(error);
    }
  }
}
