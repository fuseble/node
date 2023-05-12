import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientOptions } from 'redis';
import debugCreator from '@/debug';

export type RedisClientType = ReturnType<typeof createClient>;

const debug = debugCreator('socket.io/redis');

export class SocketRedis {
  public pubClient: RedisClientType;
  public subClient: RedisClientType;
  public io: Server;

  constructor(pubClient: any, subClient: any, io: Server) {
    this.pubClient = pubClient;
    this.subClient = subClient;
    this.io = io;
  }

  public static launch = async (io: Server, options: RedisClientOptions) => {
    const pubClient = createClient(options);
    const subClient = pubClient.duplicate();

    pubClient.on('error', err => {
      debug(`error on pubClient, ${JSON.stringify(err)}`);
    });

    subClient.on('error', err => {
      debug(`error on subClient, ${JSON.stringify(err)}`);
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);
    debug('redis connected');

    const adapter = createAdapter(pubClient, subClient, { key: 'socket.io' });
    io.adapter(adapter);

    return new SocketRedis(pubClient, subClient, io);
  };

  public set = async (key: string, value: any, time?: number | string) => {
    debug(`pubClient set ${key} ${value} ${time}`);
    let realTime: number = 60 * 60 * 24; // 1일
    if (typeof time === 'number') realTime = time;
    else if (typeof time === 'string') {
      if (time.endsWith('d')) realTime = 60 * 60 * 24 * Number(time.replace('d', ''));
      else if (time.endsWith('h')) realTime = 60 * 60 * Number(time.replace('h', ''));
      else if (time.endsWith('m')) realTime = 60 * Number(time.replace('m', ''));
    }

    await this.pubClient.set(key, value, {
      EX: realTime, // 기본값 1일
      NX: true,
    });
  };

  public get = async (key: string) => {
    const value = await this.pubClient.get(key);
    debug(`pubClient get ${key} ${value}`);

    return value;
  };
}
