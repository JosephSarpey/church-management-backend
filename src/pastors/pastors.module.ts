import { Module } from '@nestjs/common';
import { PastorsService } from './pastors.service';
import { PastorsController } from './pastors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PastorsController],
  providers: [PastorsService, PrismaService],
  exports: [PastorsService]
})
export class PastorsModule {}
