import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async syncUser(userData: any) {
    try {
      const { id, email_addresses, first_name, last_name } = userData;
      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        throw new Error('No email found in user data');
      }

      try {
        const user = await this.prisma.user.upsert({
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
            role: 'ADMIN', // Default role
            isActive: true,
          },
        });

        return user;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
}





