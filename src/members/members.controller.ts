import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';

@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly clerkService: ClerkService,
  ) {}

  @Post()
  create(@Body() dto: CreateMemberDto, @Req() req: Request) {
    // prefer ClerkService extraction so client can't spoof createdById
    const actorId = this.clerkService.getUserIdFromRequest(req);
    return this.membersService.create({ ...dto, createdById: actorId });
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.membersService.findAll(skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}