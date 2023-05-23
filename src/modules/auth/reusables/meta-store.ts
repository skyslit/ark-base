export class MetaStore {
  getMetaById: (id: string) => any;
  constructor(dataSource: (id: string) => any) {
    this.getMetaById = dataSource;
  }
  queue: Array<{
    id: string;

    cb: any;
  }> = [];
  running: boolean = false;
  store: {
    [id: string]: any;
  } = {};
  async processQueue() {
    if (this.running === true) {
      return;
    }
    this.running = true;
    while (this.running === true) {
      if (this.queue.length < 1) {
        this.running = false;
        break;
      }
      const id = this.queue[0].id;
      if (this.store[id] === undefined) {
        try {
          this.store[id] = (await this.getMetaById(id)) || null;
        } catch (e) {
          this.store[id] = null;
        }
      }
      this.queue[0].cb(this.store[id]);
      this.queue.splice(0, 1);
    }
  }
  resolveMeta(id: string, cb: (...args: any[]) => void) {
    this.queue.push({
      id,
      cb,
    });
    this.processQueue();
  }
}