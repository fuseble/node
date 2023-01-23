import http from 'http';
import { Server, type ServerOptions, type Socket } from 'socket.io';
import f_debug from 'f.debug';

const debug = f_debug('socket.io');

export type SocketTaskResult = any | void | boolean | undefined;

export type SocketStartTask = (socket: Socket) => Promise<SocketTaskResult> | SocketTaskResult;

export type SocketEndTask = SocketStartTask;

export type SocketDisconnectTask = SocketStartTask;

export type SocketTaskFunc = (
  socket: Socket,
  props: { event: string; data?: any; io: Server; createdAt: Date },
) => Promise<void> | void;

export type SocketTask = {
  key: string;
  task: SocketTaskFunc;
};

export class SocketServer {
  public io: Server;
  public startTasks: SocketStartTask[] = [];
  public tasks: Array<SocketTask | SocketTask[]> = [];
  public endTasks: SocketEndTask[] = [];
  public disconnectTasks: SocketDisconnectTask[] = [];

  constructor(http: http.Server, options?: Partial<ServerOptions>) {
    this.io = new Server(http, options);

    this.io.on('connection', async socket => {
      debug(`socket connected, ${socket.id}`);

      // 시작하기 전 이벤트 및 검증
      if (this.startTasks.length > 0) {
        const results = await Promise.all(this.startTasks.map((task: SocketStartTask) => task(socket)));
        if (results.some((result: SocketTaskResult) => result === false)) {
          socket.disconnect();
          return;
        }
      }

      // 이벤트 등록
      socket.onAny((event: string, data) => {
        debug(`socket event, [${event}] ${JSON.stringify(data)}`);
        this.tasks.forEach(task => {
          if (Array.isArray(task)) {
            task.forEach(t => {
              if (t.key === event) {
                t.task(socket, { event, data, io: this.io, createdAt: new Date() });
              }
            });
          } else {
            if (task.key === event) {
              task.task(socket, { event, data, io: this.io, createdAt: new Date() });
            }
          }
        });
      });

      if (this.endTasks.length > 0) {
        const results = await Promise.all(this.startTasks.map((task: SocketStartTask) => task(socket)));
        if (results.some((result: SocketTaskResult) => result === false)) {
          socket.disconnect();
          return;
        }
      }
    });

    // 종료하기 전 이벤트
    this.io.on('disconnect', async socket => {
      if (this.disconnectTasks.length > 0) {
        await Promise.all(this.disconnectTasks.map((task: SocketDisconnectTask) => task(socket)));
      }
    });
  }

  #getTask = (task: SocketTask | SocketTask[] | string) => {
    let taskKey: string | undefined;

    if (typeof task === 'string') taskKey = task;
    else if (Array.isArray(task)) taskKey = task[0].key;
    else taskKey = task.key;

    const index = this.tasks.findIndex(t => {
      if (Array.isArray(t)) {
        return t.some(tt => tt.key === taskKey);
      } else {
        return t.key === taskKey;
      }
    });

    return { index, key: taskKey };
  };

  public setStartTasks(tasks?: SocketStartTask[] | SocketStartTask) {
    if (!tasks) this.startTasks = [];
    else this.startTasks = Array.isArray(tasks) ? tasks : [tasks];
  }

  public setEndTasks(tasks?: SocketEndTask[] | SocketEndTask) {
    if (!tasks) this.endTasks = [];
    else this.endTasks = Array.isArray(tasks) ? tasks : [tasks];
  }

  public setDisconnectTasks(tasks?: SocketDisconnectTask[] | SocketDisconnectTask) {
    if (!tasks) this.disconnectTasks = [];
    else this.disconnectTasks = Array.isArray(tasks) ? tasks : [tasks];
  }

  public addTasks(tasks: Array<SocketTask | SocketTask[]> | SocketTask | SocketTask[]) {
    if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        const { index, key } = this.#getTask(task);
        debug(`task added, ${key}`);

        if (index > -1) {
          (this.tasks as any)[index] = task;
        } else {
          this.tasks.push(task);
        }
      });
    } else {
      const { index, key } = this.#getTask(tasks);
      debug(`task added, ${key}`);

      if (index > -1) {
        (this.tasks as any)[index] = tasks;
      } else {
        this.tasks.push(tasks);
      }
    }
  }

  public removeTask(task: SocketTask | SocketTask[] | string) {
    const { index, key } = this.#getTask(task);
    if (index > -1) {
      debug(`task removed, ${key}`);
      this.tasks.splice(index, 1);
    } else {
      debug(`task not found, ${key}`);
    }
  }
}
