import { PartialType } from '@nestjs/mapped-types';
import { CreateTitheDto } from './create-tithe.dto';

export class UpdateTitheDto extends PartialType(CreateTitheDto) {}
