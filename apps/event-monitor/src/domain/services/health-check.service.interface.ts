export interface DatabaseHealth {
  status: "up" | "down";
  latencyMs: number;
  name?: string;
}

export interface SystemMeta {
  podId?: string;
  node: string;
  env: string;
  uptimeSec: number;
  pid: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
}

export interface HealthCheckResult {
  healthy: boolean;
  status: "ok" | "degraded" | "down";
  timestamp: string;
  meta: SystemMeta;
  services: {
    database: DatabaseHealth;
  };
}

export interface IHealthCheckService {
  checkHealth(): Promise<HealthCheckResult>;

  isReady(): Promise<boolean>;

  isAlive(): boolean;
}
