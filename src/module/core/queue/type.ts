export interface JobOptions {
  jobId?: string;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  priority?: number;
}

export interface Job<T = any> {
  id: string | number;
  data: T;
  opts: JobOptions;
}

export interface QueueJob<T = any> {
  id: string;
  data: T;
}
