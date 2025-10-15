import { Gender, MaritalStatus, MembershipStatus } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsEnum(MembershipStatus)
  membershipStatus?: MembershipStatus;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @IsOptional()
  @IsBoolean()
  baptized?: boolean;

  @IsOptional()
  @IsDateString()
  baptismDate?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // optional: record which user created this member (if not using auth extraction)
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  familyMembers?: Array<{
    name: string;
    relationship: string;
  }>;
}