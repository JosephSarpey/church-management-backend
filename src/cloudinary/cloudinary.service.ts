import 'multer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as stream from 'stream';
import { ConfigService } from '@nestjs/config';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'church-events',
          resource_type: 'auto',
          // Ensure we get all the fields we need in the response
          eager: [],
          eager_async: false,
          type: 'upload',
          invalidate: true
        },
        (error, result: any) => {
          if (error) return reject(error);
          if (!result) {
            return reject(new Error('No result from Cloudinary'));
          }
          // Map the Cloudinary response to our CloudinaryResponse interface
          const response: CloudinaryResponse = {
            asset_id: result.asset_id,
            public_id: result.public_id,
            version: result.version,
            version_id: result.version_id,
            signature: result.signature,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            created_at: result.created_at,
            tags: result.tags || [],
            bytes: result.bytes,
            type: result.type,
            etag: result.etag,
            placeholder: result.placeholder || false,
            url: result.secure_url || result.url,
            secure_url: result.secure_url,
            access_mode: result.access_mode,
            original_filename: result.original_filename || file.originalname,
            folder: result.folder || 'church-events'
          };
          resolve(response);
        },
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<CloudinaryResponse[]> {
    return Promise.all(files.map(file => this.uploadFile(file)));
  }

  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}
