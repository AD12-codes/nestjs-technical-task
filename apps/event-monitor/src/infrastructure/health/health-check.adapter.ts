import type {
  DatabaseHealth,
  HealthCheckResult,
  IHealthCheckService,
  SystemMeta,
} from "@domain/services/health-check.service.interface";
import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

@Injectable()
export class HealthCheckAdapter implements IHealthCheckService {
  private readonly startTime: number;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.startTime = Date.now();
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const dbHealth = await this.checkDatabase();
    const meta = this.getSystemMeta();

    const healthy = dbHealth.status === "up";
    const status = healthy ? "ok" : "degraded";

    return {
      healthy,
      status,
      timestamp: new Date().toISOString(),
      meta,
      services: {
        database: dbHealth,
      },
    };
  }

  async isReady(): Promise<boolean> {
    const dbHealth = await this.checkDatabase();
    return dbHealth.status === "up";
  }

  isAlive(): boolean {
    return true;
  }

  private async checkDatabase(): Promise<DatabaseHealth> {
    try {
      const startTime = Date.now();
      if (this.connection.db) {
        await this.connection.db.admin().ping();
      }

      const latencyMs = Date.now() - startTime;
      const isConnected = this.connection.readyState === 1;

      return {
        status: isConnected ? "up" : "down",
        latencyMs,
        name: this.connection.name,
      };
    } catch {
      return {
        status: "down",
        latencyMs: -1,
        name: this.connection.name,
      };
    }
  }

  private getSystemMeta(): SystemMeta {
    const memUsage = process.memoryUsage();
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      podId: process.env.HOSTNAME || process.env.POD_ID,
      node: process.version,
      env: process.env.NODE_ENV || "development",
      uptimeSec,
      pid: process.pid,
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
    };
  }
}
