import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';
import { Prisma } from '@prisma/client';
import { PastorResponseDto } from './dto/pastor-response.dto';

@Injectable()
export class PastorsService {
  constructor(private prisma: PrismaService) {}

  async create(createPastorDto: CreatePastorDto): Promise<PastorResponseDto> {
    return new PastorResponseDto(
      await this.prisma.pastor.create({
        data: {
          ...createPastorDto,
          dateAppointed: new Date(createPastorDto.dateAppointed),
        },
      }),
    );
  }

  async findAll(): Promise<PastorResponseDto[]> {
    const pastors = await this.prisma.pastor.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return pastors.map((pastor) => new PastorResponseDto(pastor));
  }

  async findOne(id: string): Promise<PastorResponseDto> {
    const pastor = await this.prisma.pastor.findUnique({
      where: { id },
    });

    if (!pastor) {
      throw new NotFoundException(`Pastor with ID ${id} not found`);
    }

    return new PastorResponseDto(pastor);
  }

  async update(
    id: string,
    updatePastorDto: UpdatePastorDto,
  ): Promise<PastorResponseDto> {
    try {
      const data: Prisma.PastorUpdateInput = {
  ...updatePastorDto,
  ...(updatePastorDto.dateAppointed
    ? { dateAppointed: new Date(updatePastorDto.dateAppointed) }
    : {}),
};
const updatedPastor = await this.prisma.pastor.update({
  where: { id },
  data,
});
      return new PastorResponseDto(updatedPastor);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Pastor with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.pastor.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Pastor with ID ${id} not found`);
      }
      throw error;
    }
  }
}