import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { $Enums } from '@prisma/client';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Mark attendance for a member' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Attendance already marked for this member and service type today' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.markAttendance(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records with optional filters' })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Start date in ISO 8601 format (e.g., 2023-10-01 or 2023-10-01T00:00:00Z)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'End date in ISO 8601 format (e.g., 2023-10-31 or 2023-10-31T23:59:59Z)'
  })
  @ApiQuery({ 
    name: 'memberId', 
    required: false,
    description: 'Filter by member ID'
  })
  @ApiQuery({ 
    name: 'serviceType', 
    required: false,
    enum: $Enums.ServiceType,
    description: 'Filter by service type'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Return all attendance records' })
  async findAll(
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('memberId') memberId?: string,
    @Query('serviceType') serviceType?: $Enums.ServiceType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    try {
      if (startDateStr) {
        startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
          throw new Error('Invalid date format');
        }
      }
      if (endDateStr) {
        endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }
      }
    } catch (error) {
      throw new BadRequestException('Invalid date format. Please use ISO 8601 format (e.g., YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)');
    }

    return this.attendanceService.findAll(
      startDate,
      endDate,
      memberId,
      serviceType,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiQuery({ 
    name: 'startDate', 
    required: true, 
    description: 'Start date in ISO 8601 format (e.g., 2023-10-01 or 2023-10-01T00:00:00Z)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: true, 
    description: 'End date in ISO 8601 format (e.g., 2023-10-31 or 2023-10-31T23:59:59Z)'
  })
  @ApiResponse({ status: 200, description: 'Return attendance statistics' })
  async getStats(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    let startDate: Date;
    let endDate: Date;

    try {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      throw new BadRequestException('Invalid date format. Please use ISO 8601 format (e.g., YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)');
    }

    return this.attendanceService.getAttendanceStats(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Return attendance record' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record updated' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }
}