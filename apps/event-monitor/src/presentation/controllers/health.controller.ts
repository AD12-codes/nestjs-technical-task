import type { CheckSystemHealthUseCase } from "@application/use-cases/check-system-health.use-case";
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  constructor(private readonly checkSystemHealthUseCase: CheckSystemHealthUseCase) {}

  @Get()
  async check() {
    return await this.checkSystemHealthUseCase.execute();
  }

  @Get("ready")
  async ready() {
    return await this.checkSystemHealthUseCase.executeReadiness();
  }

  @Get("live")
  live() {
    return this.checkSystemHealthUseCase.executeLiveness();
  }
}
