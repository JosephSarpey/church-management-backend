import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClerkService } from './clerk.service';

@Global()
@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    {
      provide: 'CLERK_CONFIG',
      useFactory: (configService: ConfigService) => ({
        secretKey: configService.get<string>('CLERK_SECRET_KEY'),
        publishableKey: configService.get<string>('CLERK_PUBLISHABLE_KEY'),
        webhookSecret: configService.get<string>('CLERK_WEBHOOK_SECRET'),
      }),
      inject: [ConfigService],
    },
    ClerkService,
  ],
  exports: [ClerkService],
})
export class ClerkModule {}
