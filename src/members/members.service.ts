import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDate(value?: string | Date | null): Date | undefined {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d;
  }

  async create(data: CreateMemberDto) {
    if (data.email) {
      const existing = await this.prisma.$queryRaw`
        SELECT id FROM "Member" WHERE LOWER(email) = LOWER(${data.email}) LIMIT 1
      `;
      if (existing && Array.isArray(existing) && existing.length > 0) {
        throw new ConflictException('A member with this email already exists');
      }
    }

    // Get the latest member number and increment it
    const result = await this.prisma.$queryRaw<{ memberNumber: string }[]>`
      SELECT "memberNumber" FROM "Member" 
      ORDER BY "memberNumber" DESC 
      LIMIT 1
    `;

    let nextMemberNumber = '0001';
    if (result && result.length > 0) {
      const currentNumber = parseInt(result[0].memberNumber, 10);
      nextMemberNumber = (currentNumber + 1).toString().padStart(4, '0');
    }

    const { familyMembers, ...memberData } = data;

    const payload: any = {
      memberNumber: nextMemberNumber,
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      phone: memberData.phone,
      dateOfBirth: this.parseDate(memberData.dateOfBirth as any),
      joinDate: this.parseDate(memberData.joinDate as any) || new Date(),
      baptismDate: this.parseDate(memberData.baptismDate as any),
      gender: memberData.gender,
      maritalStatus: memberData.maritalStatus,
      membershipStatus: memberData.membershipStatus,
      address: memberData.address,
      city: memberData.city,
      state: memberData.state,
      country: memberData.country,
      postalCode: memberData.postalCode,
      baptized: memberData.baptized || false,
      occupation: memberData.occupation,
      emergencyContact: memberData.emergencyContact,
      emergencyPhone: memberData.emergencyPhone,
      notes: memberData.notes,
    };

    // Include createdById if provided (or set from controller using auth)
    if (memberData.createdById) payload.createdById = memberData.createdById;

    // Handle family members if provided
    if (familyMembers && familyMembers.length > 0) {
      payload.familyMembers = {
        create: familyMembers.map(fm => ({
          name: fm.name,
          relationship: fm.relationship,
        })),
      };
    }

    return this.prisma.member.create({
      data: payload,
      include: {
        familyMembers: true,
      },
    });
  }

  async findAll(skip = 0, take = 50) {
    return this.prisma.member.findMany({
      skip,
      take,
      include: { 
        familyMembers: true, 
        groups: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { 
        familyMembers: true, 
        groups: true, 
        tithes: true, 
        Attendance: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: string, data: UpdateMemberDto) {
    await this.findOne(id);
    const { createdById, familyMembers, ...updateData } = data as any;
    
    const payload: any = {
      ...updateData,
      dateOfBirth: this.parseDate(data.dateOfBirth as any),
      joinDate: this.parseDate(data.joinDate as any),
      baptismDate: this.parseDate(data.baptismDate as any),
    };

    // Handle family members update if provided
    if (familyMembers && Array.isArray(familyMembers)) {
      // First, delete all existing family members for this member
      await this.prisma.familyMember.deleteMany({
        where: { memberId: id }
      });
      
      // Then create the new set of family members
      if (familyMembers.length > 0) {
        payload.familyMembers = {
          create: familyMembers.map((fm: any) => ({
            name: fm.name,
            relationship: fm.relationship
          }))
        };
      }
    }

    return this.prisma.member.update({
      where: { id },
      data: payload,
      include: { familyMembers: true } 
    });
  }

  async remove(id: string) {
  await this.findOne(id);
  
  // First delete all related family members
  await this.prisma.familyMember.deleteMany({
    where: { memberId: id }
  });

  // Then delete the member
  return this.prisma.member.delete({
    where: { id }
  });
}

  /**
   * Get total count of members and previous period count for percentage change
   * @returns Object containing current count and previous period count
   */
  async countMembers(): Promise<{ count: number; previousCount: number }> {
    // Get current count
    const count = await this.prisma.member.count();
    
    // Get count from 30 days ago for percentage change calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousCount = await this.prisma.member.count({
      where: {
        createdAt: {
          lte: thirtyDaysAgo
        }
      }
    });
    
    return { 
      count,
      previousCount
    };
  }
}