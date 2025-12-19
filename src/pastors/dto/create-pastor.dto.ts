import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreatePastorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    dateAppointed: string;

    @IsString()
    @IsNotEmpty()
    currentStation: string;
}
