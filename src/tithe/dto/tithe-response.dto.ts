import { ApiProperty } from '@nestjs/swagger';
import { PaymentType, PaymentMethod } from '../enums/tithe.enum';

export class TitheResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  memberId: string;

  @ApiProperty()
  memberName?: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentDate: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  reference?: string;

  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @ApiProperty()
  recordedBy: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}