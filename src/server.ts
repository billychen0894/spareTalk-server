import { App } from '@/app';
import { ChatRoute } from '@/routes/chats.route';
import { setupPrimary } from '@socket.io/cluster-adapter';
import { ValidateEnv } from '@utils/validateEnv';
import { ChatSocket } from '@websocket/chat.socket';
import { Websocket } from '@websocket/websocket';
import cluster from 'cluster';
import { availableParallelism } from 'os';

ValidateEnv();

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  // create one worker per available core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 4040 + i,
    });
  }

  // set up the adapter on the primary thread
  setupPrimary();
} else {
  const app = new App([new ChatRoute()]);

  const httpServer = app.getHttpServer();
  const io = Websocket.getWebsocket(httpServer);

  io.initializeHandlers([
    {
      path: '/chat',
      handler: new ChatSocket(),
    },
  ]);

  app.listen();
}
