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
} from '@nestjs/common';
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
    

    return this.eventsService.create({
      ...createEventDto,
    }, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all events.' })
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
  findUpcoming() {
    return this.eventsService.findAll({
      where: {
        AND: [
          { startTime: { gte: new Date() } },
          { status: 'PUBLISHED' as const }
        ]
      } as Prisma.EventWhereInput,
      orderBy: { startTime: 'asc' },
      take: 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({ status: 200, description: 'Return the event.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
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

    return this.eventsService.update(id, updateEventDto, files);
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
    return this.eventsService.remove(id);
  }
}