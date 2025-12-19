import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkModule } from '../clerk/clerk.module';

@Module({
  imports: [
    ClerkModule, 
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
