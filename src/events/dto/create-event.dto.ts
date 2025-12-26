import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Start time in ISO 8601 format (e.g., 2023-01-01T10:00:00.000Z)'
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time in ISO 8601 format (e.g., 2023-01-01T12:00:00.000Z)'
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ enum: ServiceType })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean = false;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  recurringPattern?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  attendees?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  maxAttendees?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  registrationRequired?: boolean = false;

  @ApiProperty({ default: 'PUBLISHED' })
  @IsString()
  @IsOptional()
  status?: string = 'PUBLISHED';
}
