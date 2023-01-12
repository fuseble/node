process.env.DEBUG = 'test:*,fuseble:*';

import { App } from 'f.express';
import { SocketServer } from 'f.socket.io';
import { SocketRedis } from 'f.redis';
import { getPrefixDebugCreator } from 'common';

const debug = getPrefixDebugCreator('test')('index');

(async () => {
  const app = new App({ controllers: {} });
  const socket = new SocketServer(app.server);
  const redis = await SocketRedis.launch(socket.io, { url: 'redis://localhost:6379' });

  socket.setStartTasks(async socket => {
    debug(`socket.id = ${socket.id}`);
    const key = `lastLogined/${socket.id}`;
    await redis.set(key, Date.now().toString(), '1d');
    return !!(await redis.get(key));
  });

  socket.addTasks([
    {
      key: 'message',
      task: (socket, { data, createdAt }) => {
        debug('message', data);
        socket.emit('message', { ...data, createdAt });
      },
    },
  ]);

  app.listen(8000);
})();
