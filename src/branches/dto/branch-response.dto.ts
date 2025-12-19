import { ApiProperty } from "@nestjs/swagger";

export class BranchResponseDto {
    @ApiProperty({ description: 'Unique identifier for the branch' })
    id: string;

    @ApiProperty({ description: 'Name of the branch' })
    name: string;

    @ApiProperty({ description: 'Number of members in the branch' })
    memberCount: number;

    @ApiProperty({ description: 'Total income of the branch' })
    income: number;

    @ApiProperty({ description: 'Total expenditure of the branch' })
    expenditure: number;

    @ApiProperty({ description: 'List of events associated with the branch' })
    events: string;

    @ApiProperty({ description: 'Current project of the branch' })
    currentProject: string;

    @ApiProperty({ description: 'Address of the branch' })
    address: string;

    @ApiProperty({ description: 'Description of the branch' })
    description: string;

    @ApiProperty({ description: 'Pastor associated with the branch' })
    pastorId: string;

    @ApiProperty({ description: 'Date when the record was created', type: Date })
    createdAt: Date;

    @ApiProperty({ description: 'Date when the record was last updated', type: Date })
    updatedAt: Date;
}
