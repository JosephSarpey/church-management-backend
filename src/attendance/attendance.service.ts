import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(createAttendanceDto: CreateAttendanceDto) {
  const { memberId, isVisitor, visitorName, serviceType, date = new Date(), notes, takenBy } = createAttendanceDto;
  
  if (!isVisitor && !memberId) {
    throw new BadRequestException('Member ID is required for non-visitor attendance');
  }

  if (isVisitor && !visitorName) {
    throw new BadRequestException('Visitor name is required');
  }

  if (!takenBy) {
    throw new BadRequestException('Taken by is required');
  }

  // Check for existing attendance
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAttendance = await this.prisma.attendance.findFirst({
    where: {
      OR: [
        // For members
        memberId ? { 
          memberId,
          isVisitor: false,
          serviceType: serviceType as any,
          date: { gte: startOfDay, lte: endOfDay }
        } : undefined,
        // For visitors
        isVisitor ? {
          visitorName,
          isVisitor: true,
          serviceType: serviceType as any,
          date: { gte: startOfDay, lte: endOfDay }
        } : undefined
      ].filter(Boolean)
    },
  });

  if (existingAttendance) {
    throw new ConflictException('Attendance already marked for this person and service type today');
  }

  return this.prisma.attendance.create({
    data: {
      memberId: isVisitor ? null : memberId,
      serviceType: serviceType as any,
      date: new Date(date),
      notes,
      isVisitor,
      visitorName: isVisitor ? visitorName : null,
      contact: isVisitor ? createAttendanceDto.contact : null,
      address: isVisitor ? createAttendanceDto.address : null,
      takenBy,
    },
    include: {
      member: true,
    },
  });
}

  async findAll(
    startDate?: Date,
    endDate?: Date,
    memberId?: string,
    serviceType?: string,
  ) {
    const where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        member: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id);

    const updateData: any = { ...updateAttendanceDto };
    if (updateAttendanceDto.memberId) {
      updateData.member = { connect: { id: updateAttendanceDto.memberId } };
      delete updateData.memberId;
    }

    return this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        member: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.attendance.delete({
      where: { id },
    });
  }

  async getAttendanceStats(startDate: Date, endDate: Date) {
    const stats = await this.prisma.attendance.groupBy({
      by: ['serviceType'],
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: true,
    });

    return stats.map(stat => ({
      serviceType: stat.serviceType,
      count: stat._count,
    }));
  }
}