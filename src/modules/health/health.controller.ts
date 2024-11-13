import {Controller, Get, ServiceUnavailableException} from '@nestjs/common';
import {Sequelize} from 'sequelize-typescript';

@Controller('health')
export class HealthController {
  constructor(private readonly sequelize: Sequelize) {}

  @Get('/liveness')
  async getLiveness() {
    return {
      status: 'OK'
    };
  }

  @Get('/readiness')
  async getReadiness() {
    try {
      await this.sequelize.authenticate();
    } catch {
      throw new ServiceUnavailableException();
    }

    return {
      sequelize: 'OK'
    };
  }
}
