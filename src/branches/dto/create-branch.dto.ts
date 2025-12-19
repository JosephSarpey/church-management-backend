import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateBranchDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    memberCount: number;

    @IsNumber()
    @IsNotEmpty()
    income: number;

    @IsNumber()
    @IsNotEmpty()
    expenditure: number;

    @IsString()
    @IsNotEmpty()
    events: string;

    @IsString()
    @IsNotEmpty()
    currentProject: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    pastorId: string;
}
