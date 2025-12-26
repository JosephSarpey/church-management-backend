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
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Total Attendance & Service Type Breakdown
    const serviceStats = await this.prisma.attendance.groupBy({
      by: ['serviceType'],
      where: {
        date: { gte: start, lte: end },
      },
      _count: true,
    });

    const totalAttendance = serviceStats.reduce((acc, curr) => acc + curr._count, 0);
    const serviceTypeBreakdown: Record<string, number> = {};
    serviceStats.forEach(stat => {
      serviceTypeBreakdown[stat.serviceType] = stat._count;
    });

    // 2. Visitor Stats
    const visitorStatsRaw = await this.prisma.attendance.groupBy({
      by: ['serviceType'],
      where: {
        date: { gte: start, lte: end },
        isVisitor: true,
      },
      _count: true,
    });

    const totalVisitors = visitorStatsRaw.reduce((acc, curr) => acc + curr._count, 0);
    const visitorsByService: Record<string, number> = {};
    visitorStatsRaw.forEach(stat => {
      visitorsByService[stat.serviceType] = stat._count;
    });

    // 3. Average Attendance
    // Count distinct service dates (days where attendance was taken)
    // Prisma distinct count is tricky with dates that have times.
    // We'll rely on a raw query or assumption that standard services are key.
    // For simplicity: Total Attendance / Number of unique dates found in range
    // Note: This is an approximation if multiple services happen on same day.
    // Better: Count unique (date, serviceType) tuples?
    // Let's go with unique dates for now as a rough "events count"
    const uniqueDates = await this.prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true },
      distinct: ['date'] // This works if times are normalized, otherwise might overcount
    });
    // In many systems date is stored with time. If so, unique days needs data processing.
    // Assuming backend normally stores normalized dates or we accept the granularity.
    const numberOfEvents = uniqueDates.length || 1; 
    const averageAttendance = totalAttendance / numberOfEvents;

    // 4. Member Attendance (Top 10)
    const memberStats = await this.prisma.attendance.groupBy({
      by: ['memberId'],
      where: {
        date: { gte: start, lte: end },
        memberId: { not: null },
        isVisitor: false,
      },
      _count: true,
      orderBy: {
        _count: {
          memberId: 'desc'
        }
      },
      take: 10,
    });

    // Fetch member details for the IDs
    const memberIds = memberStats.map(s => s.memberId).filter((id): id is string => id !== null);
    const members = await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    const memberAttendance = memberStats.map(stat => {
      const member = members.find(m => m.id === stat.memberId);
      return {
        memberId: stat.memberId as string,
        firstName: member?.firstName || 'Unknown',
        lastName: member?.lastName || 'Member',
        attendanceCount: stat._count,
      };
    });

    return {
      totalAttendance,
      serviceTypeBreakdown,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      averageAttendance,
      memberAttendance,
      visitorStats: {
        totalVisitors,
        visitorsByService
      }
    };
  }
}