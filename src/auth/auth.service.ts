import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from '../clerk/clerk.service';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private clerkService: ClerkService,
  ) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      // include: { memberProfile: true }, // TODO: Enable this when memberProfile is added to User model
    });
  }

  async verifyWebhook(
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    body: any,
  ): Promise<boolean> {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('CLERK_WEBHOOK_SECRET is not set');
      }

      const wh = new Webhook(webhookSecret);
      const payload = JSON.stringify(body);
      const headers = {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      };

      wh.verify(payload, headers);
      return true;
    } catch (err) {
      this.logger.error('Webhook verification failed', err);
      return false;
    }
  }

  async handleUserCreated(userData: any) {
    try {
      const { id, email_addresses, first_name, last_name } = userData;
      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        throw new Error('No email found in user data');
      }

      await this.prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          firstName: first_name || '',
          lastName: last_name || '',
          isActive: true,
        },
        create: {
          clerkId: id,
          email,
          firstName: first_name || '',
          lastName: last_name || '',
          role: 'ADMIN',
          isActive: true,
        },
      });

      this.logger.log(`User created/updated: ${email}`);
    } catch (error) {
      this.logger.error('Error handling user.created event', error);
      throw error;
    }
  }

  async handleUserUpdated(userData: any) {
    try {
      const { id, email_addresses, first_name, last_name } = userData;
      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        throw new Error('No email found in user data');
      }

      await this.prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          firstName: first_name || '',
          lastName: last_name || '',
        },
      });

      this.logger.log(`User updated: ${email}`);
    } catch (error) {
      this.logger.error('Error handling user.updated event', error);
      throw error;
    }
  }

  async handleUserDeleted(clerkId: string) {
    try {
      await this.prisma.user.update({
        where: { clerkId },
        data: { isActive: false },
      });

      this.logger.log(`User deactivated: ${clerkId}`);
    } catch (error) {
      this.logger.error('Error handling user.deleted event', error);
      throw error;
    }
  }
}
