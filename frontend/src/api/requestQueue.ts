type QueueTask<T> = () => Promise<T>;

interface QueueItem {
  task: QueueTask<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  signal?: AbortSignal;
}

export class RequestQueue {
  private readonly concurrency: number;
  private active = 0;
  private readonly queue: QueueItem[] = [];

  constructor(concurrency = 6) {
    this.concurrency = Math.max(1, Math.trunc(concurrency));
  }

  enqueue<T>(task: QueueTask<T>, signal?: AbortSignal) {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as QueueTask<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        signal,
      });
      this.pump();
    });
  }

  clearPending(reason = new Error('cancelled')) {
    while (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.reject(reason);
    }
  }

  private pump() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) {
        continue;
      }

      if (item.signal?.aborted) {
        item.reject(new Error('cancelled'));
        continue;
      }

      this.active += 1;
      item.task()
        .then(item.resolve, item.reject)
        .finally(() => {
          this.active = Math.max(0, this.active - 1);
          this.pump();
        });
    }
  }
}

export const globalRequestQueue = new RequestQueue(5);
