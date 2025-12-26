import 'multer';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, Prisma, ServiceType } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type EventWithRelations = Prisma.EventGetPayload<{
  include: { 
    group: true;
  };
}> & {
  group: {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    leaderId: string;
  } | null;
};

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    files?: Express.Multer.File[],
  ): Promise<EventWithRelations> {
    // Extract all fields we need from the DTO
    const { 
      title,
      description,
      location,
      type,
      isRecurring = false,
      recurringPattern,
      maxAttendees,
      registrationRequired = false,
      startTime,
      endTime,
      imageUrl,
      groupId,
      status = 'PUBLISHED'
    } = createEventDto;
    
    // Upload new files to Cloudinary if any
    let uploadedImageUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        console.log('Starting file upload to Cloudinary...');
        console.log('Files to upload:', files.map(f => ({
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
        })));
        
        const uploadResults = await this.cloudinaryService.uploadFiles(files);
        console.log('Upload results:', uploadResults);
        
        uploadedImageUrls = uploadResults.map(result => {
          if (!result.secure_url) {
            console.error('Upload result missing secure_url:', result);
            throw new Error('Failed to get URL for uploaded file');
          }
          return result.secure_url;
        });
      } catch (error: unknown) {
        console.error('Error uploading files to Cloudinary:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new BadRequestException(
          `Failed to upload images to Cloudinary: ${errorMessage}. ` + 
          'Please check if the file is an image (JPG, PNG, GIF) and under 5MB.'
        );
      }
    }

    const finalImageUrl = uploadedImageUrls[0] || imageUrl || null;
    
    
    const data: Prisma.EventCreateInput = {
      title,
      description,
      location,
      type,
      isRecurring,
      recurringPattern,
      maxAttendees,
      registrationRequired,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      imageUrl: finalImageUrl,
      status,
      group: groupId ? { connect: { id: groupId } } : undefined,
    };
    
    const event = await this.prisma.event.create({
      data,
      include: {
        group: true
      }
    });

    return event as unknown as EventWithRelations;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  } = {}): Promise<EventWithRelations[]> {
    const { skip, take, cursor, where = {}, orderBy } = params;
    
    // Build the where clause - only add default filters if not explicitly overridden
    const whereClause: Prisma.EventWhereInput = {
      ...where,
      isActive: true, // Always filter out deleted events
    };

    // Only add PUBLISHED filter if status is not explicitly set
    if (!where.status) {
      whereClause.status = 'PUBLISHED';
    }
    
    const events = await this.prisma.event.findMany({
      skip,
      take,
      cursor,
      where: whereClause,
      orderBy,
      include: {
        group: true,
      },
    });

    return events as unknown as EventWithRelations[];
  }

  async count(where: Prisma.EventWhereInput = {}): Promise<number> {
    // Build the where clause - only add default filters if not explicitly overridden
    const whereClause: Prisma.EventWhereInput = {
      ...where,
      isActive: true, // Always filter out deleted events
    };

    // Only add PUBLISHED filter if status is not explicitly set
    if (!where.status) {
      whereClause.status = 'PUBLISHED';
    }

    return this.prisma.event.count({
      where: whereClause,
    });
  }

  async findOne(id: string): Promise<EventWithRelations> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        group: true
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event as unknown as EventWithRelations;
  }

  async update(
    id: string, 
    updateEventDto: UpdateEventDto,
    files?: Express.Multer.File[]
  ): Promise<Event> {
    try {
      let imageUrl: string | undefined;
      if (files && files.length > 0) {
        try {
          console.log('Starting file upload to Cloudinary...');
          const uploadResults = await this.cloudinaryService.uploadFiles(files);
          console.log('Upload results:', uploadResults);
          
          if (uploadResults.length > 0 && uploadResults[0].secure_url) {
            imageUrl = uploadResults[0].secure_url;
          }
        } catch (error) {
          console.error('Error uploading files to Cloudinary:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new BadRequestException(
            `Failed to upload images to Cloudinary: ${errorMessage}`
          );
        }
      }

      const updateData: Prisma.EventUpdateInput = {
        ...updateEventDto,
        updatedAt: new Date(),
      };

      if (updateEventDto.groupId) {
        updateData.group = { connect: { id: updateEventDto.groupId } };
        delete (updateData as any).groupId;
      }

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      return await this.prisma.event.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Event with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new BadRequestException('An event with similar details already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Event> {
    try {
      return await this.prisma.event.update({
        where: { id },
        data: { 
          isActive: false,
          updatedAt: new Date(),
        } as Prisma.EventUpdateInput,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw error;
    }
  }
}
