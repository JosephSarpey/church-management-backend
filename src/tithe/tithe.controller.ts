import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TitheService } from './tithe.service';
import { CreateTitheDto } from './dto/create-tithe.dto';
import { UpdateTitheDto } from './dto/update-tithe.dto';
import { TitheResponseDto } from './dto/tithe-response.dto';

@ApiTags('tithes')
@Controller('tithes')
export class TitheController {
  constructor(private readonly titheService: TitheService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tithe record' })
  @ApiResponse({ status: 201, description: 'The tithe record has been successfully created.', type: TitheResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  create(@Body() createTitheDto: CreateTitheDto): Promise<TitheResponseDto> {
    return this.titheService.create(createTitheDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tithe records' })
  @ApiResponse({ status: 200, description: 'Return all tithe records.', type: [TitheResponseDto] })
  @ApiQuery({ name: 'memberId', required: false, description: 'Filter tithes by member ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter tithes from this date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter tithes until this date (ISO string)' })
  async findAll(
    @Query('memberId') memberId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TitheResponseDto[]> {
    // If no filters, return all
    if (!memberId && !startDate && !endDate) {
      return this.titheService.findAll();
    }

    // Build filter
    const where: any = {};
    
    if (memberId) {
      where.memberId = memberId;
    }
    
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    return this.titheService.findAll(where);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tithe record by ID' })
  @ApiResponse({ status: 200, description: 'Return the tithe record.', type: TitheResponseDto })
  @ApiResponse({ status: 404, description: 'Tithe record not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TitheResponseDto> {
    return this.titheService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tithe record' })
  @ApiResponse({ status: 200, description: 'The tithe record has been successfully updated.', type: TitheResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Tithe record or member not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTitheDto: UpdateTitheDto,
  ): Promise<TitheResponseDto> {
    return this.titheService.update(id, updateTitheDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tithe record' })
  @ApiResponse({ status: 200, description: 'The tithe record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Tithe record not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.titheService.remove(id);
  }
}
