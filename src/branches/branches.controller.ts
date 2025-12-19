import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchResponseDto } from './dto/branch-response.dto';

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully', type: BranchResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Pastor not found' })
  async create(@Body() createBranchDto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active branches' })
  @ApiResponse({ status: 200, description: 'Returns all active branches', type: [BranchResponseDto] })
  async findAll(): Promise<BranchResponseDto[]> {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiResponse({ status: 200, description: 'Returns the branch', type: BranchResponseDto })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully', type: BranchResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Branch or pastor not found' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a branch (soft delete)' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.branchesService.remove(id);
  }
}
