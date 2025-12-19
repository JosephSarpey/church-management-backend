import { Module } from '@nestjs/common';
import { TitheService } from './tithe.service';
import { TitheController } from './tithe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TitheController],
  providers: [TitheService],
  exports: [TitheService],
})
export class TitheModule {}