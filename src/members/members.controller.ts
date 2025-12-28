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
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(@Body() dto: CreateMemberDto, @Req() req: Request) {
    // prefer ClerkService extraction so client can't spoof createdById
    const actorId = this.clerkService.getUserIdFromRequest(req);
    const result = await this.membersService.create({ ...dto, createdById: actorId });
    await this.cacheManager.clear(); // Invalidate all cache on mutation for simplicity
    return result;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_members')
  @CacheTTL(600) // 10 minutes
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('search') search?: string,
  ) {
    return this.membersService.findAll(skip, take, search);
  }

  @Get('count')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('members_count')
  @CacheTTL(3600) // 1 hour
  async countMembers() {
    return this.membersService.countMembers();
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('members_stats')
  @CacheTTL(3600) // 1 hour
  async getMemberStats() {
    return this.membersService.getMemberStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    const result = await this.membersService.update(id, dto);
    await this.cacheManager.clear();
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.membersService.remove(id);
    await this.cacheManager.clear();
    return result;
  }
}