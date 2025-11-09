// Meeting Controller
import { Response } from 'express';
import { meetingService } from '../services/meeting.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';
import Joi from 'joi';
import { MeetingType } from '@prisma/client';

const createMeetingSchema = Joi.object({
  title: Joi.string().min(1).required(),
  clientName: Joi.string().optional(),
  clientEmail: Joi.string().email().optional(),
  meetingType: Joi.string()
    .valid(...Object.values(MeetingType))
    .required(),
});

export class MeetingController {
  /**
   * POST /api/v1/meetings
   */
  async createMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { error, value } = createMeetingSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const meeting = await meetingService.createMeeting(req.user.id, value);

      res.status(201).json({ meeting });
    } catch (error) {
      logger.error('Create meeting error:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  }

  /**
   * GET /api/v1/meetings
   */
  async listMeetings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const filters = {
        type: req.query.type as MeetingType | undefined,
        stage: req.query.stage as any,
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const result = await meetingService.listMeetings(req.user.id, filters);

      res.status(200).json(result);
    } catch (error) {
      logger.error('List meetings error:', error);
      res.status(500).json({ error: 'Failed to list meetings' });
    }
  }

  /**
   * GET /api/v1/meetings/:id
   */
  async getMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const meeting = await meetingService.getMeeting(req.params.id, req.user.id);

      if (!meeting) {
        res.status(404).json({ error: 'Meeting not found' });
        return;
      }

      res.status(200).json({ meeting });
    } catch (error) {
      logger.error('Get meeting error:', error);
      res.status(500).json({ error: 'Failed to get meeting' });
    }
  }

  /**
   * PATCH /api/v1/meetings/:id
   */
  async updateMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const meeting = await meetingService.updateMeeting(req.params.id, req.user.id, req.body);

      res.status(200).json({ meeting });
    } catch (error: any) {
      logger.error('Update meeting error:', error);

      if (error.message === 'Meeting not found or access denied') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update meeting' });
      }
    }
  }

  /**
   * POST /api/v1/meetings/:id/end
   */
  async endMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const meeting = await meetingService.endMeeting(req.params.id, req.user.id);

      res.status(200).json({ meeting });
    } catch (error: any) {
      logger.error('End meeting error:', error);

      if (error.message === 'Meeting not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Meeting already ended') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to end meeting' });
      }
    }
  }

  /**
   * DELETE /api/v1/meetings/:id
   */
  async deleteMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await meetingService.deleteMeeting(req.params.id, req.user.id);

      res.status(204).send();
    } catch (error: any) {
      logger.error('Delete meeting error:', error);

      if (error.message === 'Meeting not found or access denied') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete meeting' });
      }
    }
  }

  /**
   * GET /api/v1/meetings/stats
   */
  async getMeetingStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
      const stats = await meetingService.getMeetingStats(req.user.id, period);

      res.status(200).json({ stats });
    } catch (error) {
      logger.error('Get meeting stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }
}

export const meetingController = new MeetingController();
