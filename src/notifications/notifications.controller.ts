import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotificationsService } from './notifications.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming Auth Guard exists?

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // @UseGuards(JwtAuthGuard) // Enable this when ready
  @Get(':userId')
  @UseInterceptors(CacheInterceptor)
  findAll(@Param('userId') userId: string, @Req() req: any) {
    // If we're using Clerk auth, we should ideally get the ID from the token
    // but the frontend passes it as a param too.
    return this.notificationsService.findAll(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const result = await this.notificationsService.markAsRead(id);
    await this.cacheManager.clear();
    return result;
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    const result = await this.notificationsService.markAllAsRead(userId);
    await this.cacheManager.clear();
    return result;
  }
  
  @Post('trigger-birthdays')
  async triggerBirthdays() {
    const result = await this.notificationsService.checkBirthdays();
    await this.cacheManager.clear();
    return result;
  }
}
