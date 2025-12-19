import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PaymentType, PaymentMethod } from '../enums/tithe.enum';

export class CreateTitheDto {
  @IsString()
  memberId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsString()
  recordedBy: string;

  @IsString()
  @IsOptional()
  notes?: string;
}