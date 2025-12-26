import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: { userId: string; title: string; message: string; type: string; link?: string, metadata?: any }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        metadata: data.metadata,
      },
    });

    // Real-time emit
    this.notificationsGateway.sendToUser(data.userId, notification);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Daily Cron Job to check for birthdays
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs at 00:00 every day
  async checkBirthdays() {
    const logs: string[] = [];
    logs.push('Checking for birthdays...');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    const currentDay = today.getDate();

    // Prisma doesn't have great date part filtering, so we might need raw query or fetch and filter.
    // Optimizing with raw query is better for performance if many members.
    // However, sticking to prisma syntax for safety; if small db, fetch all acceptable. 
    // Let's use raw query for exact day/month match to support leap years/etc correctly usually, 
    // but a simple filter on all members might be heavy.
    // Let's try to filter using Prisma's date functions if possible, or fetch all active members and filter in code (simplest for now).
    
    // Fetch all active members
    const members = await this.prisma.member.findMany({
      where: { membershipStatus: 'ACTIVE', dateOfBirth: { not: null } },
      select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
    });

    logs.push(`Found ${members.length} active members.`);
    
    const birthdayMembers = members.filter(member => {
      const dob = new Date(member.dateOfBirth);
      return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
    });

    logs.push(`Found ${birthdayMembers.length} members with birthday today.`);

    if (birthdayMembers.length === 0) return { logs, message: 'No birthdays today' };

    // Notify ALL Admins and Pastors
    // First, find recipients
    const recipients = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'PASTOR'] }, isActive: true },
      select: { id: true },
    });

    logs.push(`Found ${recipients.length} recipients (Admins/Pastors).`);

    for (const member of birthdayMembers) {
      const message = `Today is ${member.firstName} ${member.lastName}'s birthday!`;
      
      for (const recipient of recipients) {
        await this.create({
          userId: recipient.id,
          title: 'Birthday Alert 🎂',
          message: message,
          type: 'BIRTHDAY',
          link: `/members/${member.id}`,
          metadata: { memberId: member.id }
        });
      }
    }
    
    const successMsg = `Sent birthday notifications for ${birthdayMembers.length} members.`;
    this.logger.log(successMsg);
    logs.push(successMsg);
    
    return { logs, message: successMsg };
  }
}
