import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';

@Module({
  controllers: [MembersController],
  providers: [MembersService, PrismaService],
  exports: [MembersService],
})
export class MembersModule {}