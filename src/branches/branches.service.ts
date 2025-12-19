import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchResponseDto } from './dto/branch-response.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto): Promise<BranchResponseDto> {
    const { pastorId, ...branchData } = createBranchDto;
    
    const pastor = await this.prisma.pastor.findUnique({
      where: { id: pastorId },
    });

    if (!pastor) {
      throw new NotFoundException(`Pastor with ID ${pastorId} not found`);
    }

    const branch = await this.prisma.branch.create({
      data: {
        ...branchData,
        pastorId,
      },
      include: {
        pastor: true,
      },
    });

    return this.mapToDto(branch);
  }

  async findAll(): Promise<BranchResponseDto[]> {
    const branches = await this.prisma.branch.findMany({
      include: {
        pastor: true,
      },
    });

    return branches.map(branch => this.mapToDto(branch));
  }

  async findOne(id: string): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        pastor: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return this.mapToDto(branch);
  }

  async update(
    id: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    await this.findOne(id);

    if (updateBranchDto.pastorId) {
      const pastor = await this.prisma.pastor.findUnique({
        where: { id: updateBranchDto.pastorId },
      });

      if (!pastor) {
        throw new NotFoundException(
          `Pastor with ID ${updateBranchDto.pastorId} not found`,
        );
      }
    }

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
      include: {
        pastor: true,
      },
    });

    return this.mapToDto(updatedBranch);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.branch.delete({
      where: { id },
    });
  }

  private mapToDto(branch: any): BranchResponseDto {
    return {
      id: branch.id,
      name: branch.name,
      memberCount: branch.memberCount,
      income: branch.income,
      expenditure: branch.expenditure,
      events: branch.events,
      currentProject: branch.currentProject,
      address: branch.address,
      description: branch.description,
      pastorId: branch.pastorId,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }
}
