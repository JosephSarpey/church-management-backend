import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
})
export class AppModule {}
