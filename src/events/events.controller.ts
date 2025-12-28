import 'multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Inject,
} from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ClerkService } from '../clerk/clerk.service';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

@ApiTags('events')
@Controller('events')
//@UseGuards(ClerkAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly clerkService: ClerkService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'The event has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    if (createEventDto.startTime >= createEventDto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }
    

    const result = await this.eventsService.create({
      ...createEventDto,
    }, files);
    await this.cacheManager.clear();
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all events.' })
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;

    const limit = Math.min(take, 100); // Limit page size
    
    const [events, total] = await Promise.all([
      this.eventsService.findAll({
        skip,
        take: limit,
        where,
        orderBy: { startTime: 'asc' },
      }),
      this.eventsService.count(where),
    ]);

    // Note: Expansion in paginated list is complex. 
    // For now, we only expand in findUpcoming or when specifically requested.
    // If we wanted to expand here, we would need to do it AFTER fetching, 
    // which might break pagination consistency.

    return {
      data: events,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Return upcoming events.' })
  @UseInterceptors(CacheInterceptor)
  async findUpcoming() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Fetch all events that are either upcoming OR recurring
    const events = await this.eventsService.findAll({
      where: {
        OR: [
          { startTime: { gte: now } },
          { isRecurring: true }
        ],
        status: 'PUBLISHED' as const,
        isActive: true,
      } as Prisma.EventWhereInput,
      orderBy: { startTime: 'asc' },
      take: 50, // Fetch more to allow for expansion
    });

    // expansion logic is handled in the service but we need to call it here 
    // wait, I put expansion logic as private in service. I should make it accessible or use it inside a service method.
    // Let's refactor the service slightly to expose an expanded search or just do it in findUpcoming inside service.
    // Actually, I'll move the logic into a public service method.
    
    // For now, I'll modify the service to have a public expansion method.
    return this.eventsService.expandRecurringEvents(events, now, thirtyDaysFromNow, 1).slice(0, 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({ status: 200, description: 'Return the event.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    if (updateEventDto.startTime && updateEventDto.endTime && 
        updateEventDto.startTime >= updateEventDto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const result = await this.eventsService.update(id, updateEventDto, files);
    await this.cacheManager.clear();
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async remove(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    const result = await this.eventsService.remove(id);
    await this.cacheManager.clear();
    return result;
  }
}