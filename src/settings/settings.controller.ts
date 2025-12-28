import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('settings')
@UseGuards(ClerkAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @UseInterceptors(CacheInterceptor)
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    const result = await this.settingsService.updateSettings(updateSettingsDto);
    await this.cacheManager.clear();
    return result;
  }
}