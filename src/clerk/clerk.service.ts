import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Clerk } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class ClerkService implements OnModuleInit {
  private clerk: ReturnType<typeof Clerk>;
  private readonly logger = new Logger(ClerkService.name);

  constructor(
    @Inject('CLERK_CONFIG') private readonly config: { 
      secretKey: string;
      publishableKey: string;
      webhookSecret: string;
    },
  ) {}

  onModuleInit() {
    if (!this.config?.secretKey) {
      this.logger.error('CLERK_SECRET_KEY is not properly configured');
      throw new Error('CLERK_SECRET_KEY is not configured');
    }
    
    if (!this.config.webhookSecret) {
      this.logger.warn('CLERK_WEBHOOK_SECRET is not configured - webhook verification will fail');
    }

    this.clerk = Clerk({ 
      secretKey: this.config.secretKey,
      publishableKey: this.config.publishableKey,
    });
  }

  async verifyToken(token: string) {
    try {
      return await this.clerk.verifyToken(token);
    } catch (error: any) {
      this.logger.error('Token verification failed', error);
      throw new Error(`Token verification failed: ${error?.message || 'Invalid or expired token'}`);
    }
  }

  async getUser(userId: string) {
    try {
      return await this.clerk.users.getUser(userId);
    } catch (error: any) {
      this.logger.error(`Failed to fetch user ${userId}`, error);
      throw new Error(`Failed to fetch user: ${error?.message || 'Unknown error'}`);
    }
  }

  async getUsers(params?: any) {
    try {
      return await this.clerk.users.getUserList(params);
    } catch (error: any) {
      this.logger.error('Failed to fetch users', error);
      throw new Error(`Failed to fetch users: ${error?.message || 'Unknown error'}`);
    }
  }

  async createUser(userData: any) {
    try {
      return await this.clerk.users.createUser(userData);
    } catch (error: any) {
      this.logger.error('Failed to create user', { error, userData });
      throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
    }
  }

  async updateUser(userId: string, userData: any) {
    try {
      return await this.clerk.users.updateUser(userId, userData);
    } catch (error: any) {
      this.logger.error(`Failed to update user ${userId}`, { error, userData });
      throw new Error(`Failed to update user: ${error?.message || 'Unknown error'}`);
    }
  }

  async deleteUser(userId: string) {
    try {
      return await this.clerk.users.deleteUser(userId);
    } catch (error: any) {
      this.logger.error(`Failed to delete user ${userId}`, error);
      throw new Error(`Failed to delete user: ${error?.message || 'Unknown error'}`);
    }
  }

  getWebhookSecret(): string {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }
    return this.config.webhookSecret;
  }

  // Try several ways to get the authenticated Clerk user id from the request.
  // 1) req.user?.id (if middleware populated it)
  // 2) req.auth?.userId (some Clerk middlewares)
  // 3) decode the Bearer token and read `sub` / `user_id`
  getUserIdFromRequest(req: Request): string | null {
    const anyReq = req as any;
    if (anyReq.user?.id) return anyReq.user.id;
    if (anyReq.auth?.userId) return anyReq.auth.userId;

    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (!authHeader) return null;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.sub || decoded?.user_id || decoded?.userId || null;
    } catch (e) {
      return null;
    }
  }
}
