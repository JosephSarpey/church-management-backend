import { ServiceType } from "@prisma/client";
import { IsOptional, IsUUID, IsEnum, IsNotEmpty, IsDateString, IsString, IsBoolean } from "class-validator";


export class CreateAttendanceDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsString()
  @IsNotEmpty()
  takenBy: string;

  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isVisitor?: boolean;

  @IsString()
  @IsOptional()
  visitorName?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  address?: string;
}