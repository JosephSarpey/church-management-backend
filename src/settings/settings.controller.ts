import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('settings')
@UseGuards(ClerkAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }
}