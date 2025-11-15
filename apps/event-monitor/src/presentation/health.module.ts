import { HEALTH_CHECK_SERVICE } from "@application/ports/tokens";
import { CheckSystemHealthUseCase } from "@application/use-cases/check-system-health.use-case";
import { HealthCheckAdapter } from "@infrastructure/health/health-check.adapter";
import { Module } from "@nestjs/common";
import { HealthController } from "./controllers/health.controller";

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: HEALTH_CHECK_SERVICE,
      useClass: HealthCheckAdapter,
    },
    CheckSystemHealthUseCase,
  ],
  exports: [CheckSystemHealthUseCase],
})
export class HealthModule {}
