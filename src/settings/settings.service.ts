import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  private settingsId: string;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSettingsExist();
  }

  private async ensureSettingsExist() {
    const settings = await this.prisma.churchSettings.findFirst();
    if (!settings) {
      const newSettings = await this.prisma.churchSettings.create({
        data: {},
      });
      this.settingsId = newSettings.id;
    } else {
      this.settingsId = settings.id;
    }
  }

  async getSettings() {
    return this.prisma.churchSettings.findFirstOrThrow();
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    return this.prisma.churchSettings.update({
      where: { id: this.settingsId },
      data: updateSettingsDto,
    });
  }
}