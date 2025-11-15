import { HEALTH_CHECK_SERVICE } from "@application/ports/tokens";
import type {
  HealthCheckResult,
  IHealthCheckService,
} from "@domain/services/health-check.service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CheckSystemHealthUseCase {
  constructor(
    @Inject(HEALTH_CHECK_SERVICE)
    private readonly healthCheckService: IHealthCheckService,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    return await this.healthCheckService.checkHealth();
  }

  async executeReadiness(): Promise<{ ready: boolean; status: string }> {
    const isReady = await this.healthCheckService.isReady();

    return {
      ready: isReady,
      status: isReady ? "ready" : "not_ready",
    };
  }

  executeLiveness(): { alive: boolean; timestamp: string } {
    const isAlive = this.healthCheckService.isAlive();

    return {
      alive: isAlive,
      timestamp: new Date().toISOString(),
    };
  }
}
