import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { SettingsModule } from './settings/settings.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PastorsModule } from './pastors/pastors.module';
import { BranchesModule } from './branches/branches.module';
import { TitheModule } from './tithe/tithe.module';
import { EventsModule } from './events/events.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClerkModule } from './clerk/clerk.module';
import { KeepAliveService } from './keep-alive.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisCache');
        const url = configService.get('REDIS_URL') || 'redis://localhost:6379';
        
        try {
          const store = await redisStore({
            url,
            ttl: configService.get('REDIS_TTL') || 3600,
          });
          
          logger.log(`Redis cache connected to ${url.split('@').pop()}`);
          return { store };
        } catch (error: any) {
          logger.error(`Failed to connect to Redis: ${error.message}`);
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MembersModule,
    SettingsModule,
    AttendanceModule,
    PastorsModule,
    BranchesModule,
    TitheModule,
    EventsModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    CloudinaryModule,
    ClerkModule,
  ],
  providers: [KeepAliveService],
})
export class AppModule {}
