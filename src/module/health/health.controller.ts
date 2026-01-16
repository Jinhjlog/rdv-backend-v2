import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '@core/database/prisma.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectAuthRedis } from '@core/database/decorators';
import Redis from 'ioredis';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    @InjectAuthRedis() private readonly redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: '서버 헬스 체크' })
  @ApiResponse({
    status: 200,
    description: '모든 서비스가 정상 동작 중',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          redis: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          redis: {
            status: 'up',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: '하나 이상의 서비스가 비정상',
  })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.redisHealthCheck(),
    ]);
  }

  private async redisHealthCheck(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return {
        redis: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: error instanceof Error ? error.message : error,
        },
      };
    }
  }
}
