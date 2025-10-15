import { IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  churchName?: string;

  @IsString()
  @IsOptional()
  pastorName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsString()
  @IsOptional()
  timeFormat?: string;
}