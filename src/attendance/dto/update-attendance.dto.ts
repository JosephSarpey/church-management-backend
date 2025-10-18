import { PartialType } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';
import { $Enums } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @ApiProperty({ enum: $Enums.ServiceType, required: false })
  @IsEnum($Enums.ServiceType)
  @IsOptional()
  serviceType?: $Enums.ServiceType;
}