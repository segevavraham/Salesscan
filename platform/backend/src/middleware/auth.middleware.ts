// Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    teamId?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

/**
 * Middleware to authenticate JWT token
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        teamId: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamId || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
}

/**
 * Middleware to check user role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Middleware to check resource ownership
 */
export async function checkOwnership(
  resourceType: 'meeting' | 'team',
  paramName: string = 'id'
) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        res.status(400).json({ error: 'Resource ID not provided' });
        return;
      }

      // Admin can access all resources
      if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
        next();
        return;
      }

      // Check ownership based on resource type
      let hasAccess = false;

      if (resourceType === 'meeting') {
        const meeting = await prisma.meeting.findUnique({
          where: { id: resourceId },
          select: { userId: true, teamId: true },
        });

        hasAccess = meeting?.userId === req.user.id ||
                   (meeting?.teamId === req.user.teamId && req.user.role === 'TEAM_LEADER');
      } else if (resourceType === 'team') {
        const team = await prisma.team.findUnique({
          where: { id: resourceId },
          select: { members: { where: { id: req.user.id } } },
        });

        hasAccess = team?.members.length ? true : false;
      }

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export async function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          teamId: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          teamId: user.teamId || undefined,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}
