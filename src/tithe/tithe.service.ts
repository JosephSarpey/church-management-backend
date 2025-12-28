import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTitheDto } from './dto/create-tithe.dto';
import { UpdateTitheDto } from './dto/update-tithe.dto';
import { TitheResponseDto } from './dto/tithe-response.dto';

@Injectable()
export class TitheService {
  constructor(private prisma: PrismaService) {}

  async create(createTitheDto: CreateTitheDto): Promise<TitheResponseDto> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: createTitheDto.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${createTitheDto.memberId} not found`);
    }

    const tithe = await this.prisma.tithe.create({
      data: {
        member: {
          connect: { id: createTitheDto.memberId }
        },
        amount: createTitheDto.amount,
        paymentDate: createTitheDto.paymentDate || new Date(),
        paymentMethod: createTitheDto.paymentMethod,
        paymentType: createTitheDto.paymentType,
        recordedBy: createTitheDto.recordedBy,
        reference: createTitheDto.reference,
        notes: createTitheDto.notes,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return this.mapToDto(tithe);
  }

  async findAll(
    where?: Prisma.TitheWhereInput,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [tithes, total] = await Promise.all([
      this.prisma.tithe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      }),
      this.prisma.tithe.count({ where }),
    ]);

    return {
      data: tithes.map(tithe => this.mapToDto(tithe)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TitheResponseDto> {
    const tithe = await this.prisma.tithe.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!tithe) {
      throw new NotFoundException(`Tithe with ID ${id} not found`);
    }

    return this.mapToDto(tithe);
  }

  async update(id: string, updateTitheDto: UpdateTitheDto): Promise<TitheResponseDto> {
    // Check if tithe exists
    const existingTithe = await this.prisma.tithe.findUnique({
      where: { id },
    });

    if (!existingTithe) {
      throw new NotFoundException(`Tithe with ID ${id} not found`);
    }

    if (updateTitheDto.memberId) {
      // Check if new member exists
      const member = await this.prisma.member.findUnique({
        where: { id: updateTitheDto.memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${updateTitheDto.memberId} not found`);
      }
    }

    const updateData: Prisma.TitheUpdateInput = {
      ...(updateTitheDto.memberId && { 
        member: { connect: { id: updateTitheDto.memberId } } 
      }),
      ...(updateTitheDto.amount !== undefined && { amount: updateTitheDto.amount }),
      ...(updateTitheDto.paymentDate && { paymentDate: updateTitheDto.paymentDate }),
      ...(updateTitheDto.paymentMethod && { paymentMethod: updateTitheDto.paymentMethod }),
      ...(updateTitheDto.paymentType && { paymentType: updateTitheDto.paymentType }),
      ...('reference' in updateTitheDto && { reference: updateTitheDto.reference }),
      ...('notes' in updateTitheDto && { notes: updateTitheDto.notes }),
      ...(updateTitheDto.recordedBy && { recordedBy: updateTitheDto.recordedBy }),
    };

    const updatedTithe = await this.prisma.tithe.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return this.mapToDto(updatedTithe);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.tithe.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Tithe with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  private mapToDto(tithe: any): TitheResponseDto {
    return {
      id: tithe.id,
      memberId: tithe.memberId,
      memberName: tithe.member ? `${tithe.member.firstName} ${tithe.member.lastName}` : undefined,
      amount: tithe.amount,
      paymentDate: tithe.paymentDate,
      paymentMethod: tithe.paymentMethod,
      reference: tithe.reference || undefined,
      paymentType: tithe.paymentType,
      recordedBy: tithe.recordedBy,
      notes: tithe.notes || undefined,
      createdAt: tithe.createdAt,
      updatedAt: tithe.updatedAt,
    };
  }
}