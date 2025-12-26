import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryModule as CloudinaryModuleLib } from 'nestjs-cloudinary';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    ConfigModule,
    CloudinaryModuleLib.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get('CLOUDINARY_API_KEY'),
        api_secret: configService.get('CLOUDINARY_API_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CloudinaryService,
    ConfigService,
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}