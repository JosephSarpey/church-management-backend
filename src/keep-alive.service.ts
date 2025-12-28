import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);
  private readonly backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleKeepAlive() {
    this.logger.log(`[Keep-Alive] Pinging self at ${this.backendUrl}...`);
    try {
      const response = await fetch(this.backendUrl);
      if (response.ok) {
        this.logger.log(`[Keep-Alive] Ping successful! Status: ${response.status}`);
      } else {
        this.logger.warn(`[Keep-Alive] Ping failed with status: ${response.status}`);
      }
    } catch (error: any) {
      this.logger.error(`[Keep-Alive] Error during ping: ${error.message}`);
    }
  }
}
