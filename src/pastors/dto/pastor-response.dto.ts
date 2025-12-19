import { ApiProperty } from '@nestjs/swagger';
import { Branch } from '@prisma/client';

export class PastorResponseDto {
  @ApiProperty({ description: 'Unique identifier for the pastor' })
  id: string;

  @ApiProperty({ description: 'Full name of the pastor' })
  name: string;

  @ApiProperty({ description: 'Date when the pastor was appointed', type: Date })
  dateAppointed: Date;

  @ApiProperty({ description: 'Current station of the pastor' }) 
  currentStation: string;

  @ApiProperty({ description: 'Date when the record was created', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the record was last updated', type: Date })
  updatedAt: Date;

  constructor(partial: Partial<PastorResponseDto>) {
    Object.assign(this, partial);
  }
}
