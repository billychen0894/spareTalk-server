import { SOCKET_ORIGIN } from '@/config';
import { SocketInterface } from '@/interfaces/sockets.interface';
import { createAdapter } from '@socket.io/cluster-adapter';
import { Server, Socket } from 'socket.io';

export class Websocket extends Server {
  private static io: Websocket;

  constructor(httpServer: any) {
    super(httpServer, {
      cors: {
        origin: SOCKET_ORIGIN,
        methods: ['POST', 'GET'],
      },
      connectionStateRecovery: {},
      // set up the adapter on each worker thread
      adapter: createAdapter(),
    });
  }

  public static getWebsocket(httpServer?: any): Websocket {
    if (!Websocket.io) {
      Websocket.io = new Websocket(httpServer);
    }

    return Websocket.io;
  }

  public initializeHandlers(socketHandlers: Array<{ path: string; handler: SocketInterface }>) {
    socketHandlers.forEach(element => {
      const namespace = Websocket.io.of(element.path, (socket: Socket) => {
        element.handler.handleConnection.bind(element.handler)(socket);
      });

      if (element.handler.middlewareImplementation) {
        namespace.use(element.handler.middlewareImplementation.bind(element.handler));
      }
    });
  }
}
