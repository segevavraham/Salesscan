// Meeting Service
import { Meeting, MeetingType, SalesStage, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface CreateMeetingDTO {
  title: string;
  clientName?: string;
  clientEmail?: string;
  meetingType: MeetingType;
}

export interface UpdateMeetingDTO {
  title?: string;
  clientName?: string;
  clientEmail?: string;
  meetingType?: MeetingType;
  stage?: SalesStage;
}

export interface MeetingFilters {
  type?: MeetingType;
  stage?: SalesStage;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MeetingSummary {
  metadata: {
    title: string;
    clientName?: string;
    date: Date;
    duration: number;
    type: MeetingType;
    stage: SalesStage;
  };
  quickStats: {
    talkRatio: number;
    questionsAsked: number;
    buyingSignals: number;
    objections: number;
  };
  keyTakeaways: string[];
  whatWentWell: string[];
  areasForImprovement: string[];
  actionItems: Array<{
    description: string;
    assignedTo: string;
    dueDate?: Date;
  }>;
  aiRecommendations: {
    immediate: string[];
    beforeNextMeeting: string[];
    dealStrategy: string[];
  };
}

export class MeetingService {
  /**
   * Create a new meeting
   */
  async createMeeting(userId: string, data: CreateMeetingDTO): Promise<Meeting> {
    try {
      const meeting = await prisma.meeting.create({
        data: {
          userId,
          title: data.title,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          meetingType: data.meetingType,
          stage: 'WARMING_UP',
          startedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Meeting created: ${meeting.id} by user ${userId}`);

      return meeting;
    } catch (error) {
      logger.error('Error creating meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting by ID
   */
  async getMeeting(meetingId: string, userId: string): Promise<Meeting | null> {
    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          OR: [
            { userId },
            {
              team: {
                members: {
                  some: { id: userId },
                },
              },
            },
          ],
        },
        include: {
          transcript: {
            include: {
              segments: {
                orderBy: { startTime: 'asc' },
              },
            },
          },
          actionItems: {
            orderBy: { createdAt: 'desc' },
          },
          insights: {
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return meeting;
    } catch (error) {
      logger.error('Error getting meeting:', error);
      throw error;
    }
  }

  /**
   * List user's meetings
   */
  async listMeetings(userId: string, filters: MeetingFilters = {}): Promise<{
    meetings: Meeting[];
    total: number;
  }> {
    try {
      const where: Prisma.MeetingWhereInput = {
        OR: [
          { userId },
          {
            team: {
              members: {
                some: { id: userId },
              },
            },
          },
        ],
      };

      // Apply filters
      if (filters.type) {
        where.meetingType = filters.type;
      }

      if (filters.stage) {
        where.stage = filters.stage;
      }

      if (filters.startDate || filters.endDate) {
        where.startedAt = {};
        if (filters.startDate) {
          where.startedAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.startedAt.lte = filters.endDate;
        }
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { clientName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [meetings, total] = await Promise.all([
        prisma.meeting.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: filters.limit || 20,
          skip: filters.offset || 0,
        }),
        prisma.meeting.count({ where }),
      ]);

      return { meetings, total };
    } catch (error) {
      logger.error('Error listing meetings:', error);
      throw error;
    }
  }

  /**
   * Update meeting
   */
  async updateMeeting(
    meetingId: string,
    userId: string,
    data: UpdateMeetingDTO
  ): Promise<Meeting> {
    try {
      // Check ownership
      const existing = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId,
        },
      });

      if (!existing) {
        throw new Error('Meeting not found or access denied');
      }

      const meeting = await prisma.meeting.update({
        where: { id: meetingId },
        data,
      });

      logger.info(`Meeting updated: ${meetingId}`);

      return meeting;
    } catch (error) {
      logger.error('Error updating meeting:', error);
      throw error;
    }
  }

  /**
   * End meeting (calculate duration and finalize)
   */
  async endMeeting(meetingId: string, userId: string): Promise<Meeting> {
    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId,
        },
      });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (meeting.endedAt) {
        throw new Error('Meeting already ended');
      }

      const endedAt = new Date();
      const duration = Math.floor((endedAt.getTime() - meeting.startedAt.getTime()) / 1000);

      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          endedAt,
          duration,
        },
      });

      logger.info(`Meeting ended: ${meetingId}, duration: ${duration}s`);

      // Trigger async processing (summary generation, analytics update, etc.)
      this.processMeetingCompletion(meetingId).catch((err) => {
        logger.error('Error processing meeting completion:', err);
      });

      return updated;
    } catch (error) {
      logger.error('Error ending meeting:', error);
      throw error;
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      // Check ownership
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId,
        },
      });

      if (!meeting) {
        throw new Error('Meeting not found or access denied');
      }

      await prisma.meeting.delete({
        where: { id: meetingId },
      });

      logger.info(`Meeting deleted: ${meetingId}`);
    } catch (error) {
      logger.error('Error deleting meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    totalMeetings: number;
    totalDuration: number;
    avgScore: number;
    avgConfidence: number;
    winRate: number;
    byType: Record<MeetingType, number>;
    byStage: Record<SalesStage, number>;
  }> {
    try {
      const startDate = new Date();
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const meetings = await prisma.meeting.findMany({
        where: {
          userId,
          startedAt: {
            gte: startDate,
          },
        },
        select: {
          duration: true,
          performanceScore: true,
          confidence: true,
          stage: true,
          meetingType: true,
        },
      });

      const totalMeetings = meetings.length;
      const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
      const avgScore =
        meetings.filter((m) => m.performanceScore).reduce((sum, m) => sum + (m.performanceScore || 0), 0) /
        meetings.filter((m) => m.performanceScore).length || 0;
      const avgConfidence =
        meetings.filter((m) => m.confidence).reduce((sum, m) => sum + (m.confidence || 0), 0) /
        meetings.filter((m) => m.confidence).length || 0;

      const wonMeetings = meetings.filter((m) => m.stage === 'WON').length;
      const closedMeetings = meetings.filter((m) => m.stage === 'WON' || m.stage === 'LOST').length;
      const winRate = closedMeetings > 0 ? (wonMeetings / closedMeetings) * 100 : 0;

      const byType: Record<MeetingType, number> = meetings.reduce((acc, m) => {
        acc[m.meetingType] = (acc[m.meetingType] || 0) + 1;
        return acc;
      }, {} as Record<MeetingType, number>);

      const byStage: Record<SalesStage, number> = meetings.reduce((acc, m) => {
        acc[m.stage] = (acc[m.stage] || 0) + 1;
        return acc;
      }, {} as Record<SalesStage, number>);

      return {
        totalMeetings,
        totalDuration,
        avgScore,
        avgConfidence,
        winRate,
        byType,
        byStage,
      };
    } catch (error) {
      logger.error('Error getting meeting stats:', error);
      throw error;
    }
  }

  /**
   * Process meeting completion (async)
   */
  private async processMeetingCompletion(meetingId: string): Promise<void> {
    logger.info(`Processing meeting completion: ${meetingId}`);

    // Here we would:
    // 1. Finalize transcription
    // 2. Extract action items
    // 3. Calculate sentiment journey
    // 4. Generate AI summary
    // 5. Update user analytics
    // 6. Send notifications

    // For now, just log
    logger.info(`Meeting processing queued: ${meetingId}`);
  }
}

export const meetingService = new MeetingService();
