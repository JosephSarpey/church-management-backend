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

  @ApiQuery({ name: 'search', required: false, description: 'Search by member name' })
  @ApiQuery({ name: 'memberId', required: false, description: 'Filter tithes by member ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter tithes from this date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter tithes until this date (ISO string)' })
  @ApiQuery({ name: 'paymentMethod', required: false, description: 'Filter by payment method' })
  @ApiQuery({ name: 'paymentType', required: false, description: 'Filter by payment type' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @Get()
  @ApiOperation({ summary: 'Get all tithe records' })
  @ApiResponse({ status: 200, description: 'Return all tithe records.', type: [TitheResponseDto] })
  async findAll(
    @Query('search') search?: string,
    @Query('memberId') memberId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('paymentType') paymentType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    const where: any = {};
    
    if (search) {
      where.member = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (paymentType) {
      where.paymentType = paymentType;
    }
    
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    return this.titheService.findAll(where, page ? +page : 1, limit ? +limit : 10);
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
