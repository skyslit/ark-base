export class Bridge {
  static instance: Bridge;
  static getInstance(): Bridge {
    if (!Bridge.instance) {
      Bridge.instance = new Bridge();
    }
    return Bridge.instance;
  }

  callbacks = {};

  addEventListener(ev: string, cb: (...args: any[]) => any) {
    if (!this.callbacks[ev]) {
      this.callbacks[ev] = [];
    }

    this.callbacks[ev].push(cb);

    return () => {
      this.callbacks[ev] = this.callbacks[ev].filter((c) => c !== cb);
    };
  }

  emit(ev: string, ...args: any[]) {
    if (this.callbacks[ev]) {
      this.callbacks[ev].forEach((cb) => {
        try {
          cb && cb(...args);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
}

export default Bridge.getInstance();
