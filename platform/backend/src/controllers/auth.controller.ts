// Authentication Controller
import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';
import Joi from 'joi';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await authService.register(value);

      res.status(201).json({
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Register controller error:', error);

      if (error.message === 'User already exists') {
        res.status(409).json({ error: 'User already exists' });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await authService.login(value);

      res.status(200).json({
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Login controller error:', error);

      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({ tokens });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { prisma } = await import('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          teamId: true,
          avatar: true,
          phone: true,
          timezone: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}

export const authController = new AuthController();
