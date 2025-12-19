import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PastorsService } from './pastors.service';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';
import { PastorResponseDto } from './dto/pastor-response.dto';

@ApiTags('pastors')
@ApiBearerAuth()
@Controller('pastors')
export class PastorsController {
  constructor(private readonly pastorsService: PastorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pastor' })
  @ApiResponse({ status: 201, description: 'The pastor has been successfully created.', type: PastorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createPastorDto: CreatePastorDto): Promise<PastorResponseDto> {
    return this.pastorsService.create(createPastorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pastors' })
  @ApiResponse({ status: 200, description: 'Return all pastors.', type: [PastorResponseDto] })
  async findAll(): Promise<PastorResponseDto[]> {
    return this.pastorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pastor by ID' })
  @ApiResponse({ status: 200, description: 'Return the pastor with the specified ID.', type: PastorResponseDto })
  @ApiResponse({ status: 404, description: 'Pastor not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PastorResponseDto> {
    return this.pastorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pastor' })
  @ApiResponse({ status: 200, description: 'The pastor has been successfully updated.', type: PastorResponseDto })
  @ApiResponse({ status: 404, description: 'Pastor not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePastorDto: UpdatePastorDto,
  ): Promise<PastorResponseDto> {
    return this.pastorsService.update(id, updatePastorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pastor' })
  @ApiResponse({ status: 200, description: 'The pastor has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Pastor not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.pastorsService.remove(id);
  }
}
