import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming Auth Guard exists?

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @UseGuards(JwtAuthGuard) // Enable this when ready
  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
  
  @Post('trigger-birthdays')
  async triggerBirthdays() {
    const result = await this.notificationsService.checkBirthdays();
    return result;
  }
}
