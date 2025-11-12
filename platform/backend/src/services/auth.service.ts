// Authentication Service
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { logger } from '../config/logger';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
}

export class AuthService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          name: data.name,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          teamId: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          ...user,
          teamId: user.teamId || undefined,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          teamId: true,
          passwordHash: true,
          deletedAt: true,
          createdAt: true,
        },
      });

      if (!user || user.deletedAt) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User logged in: ${user.email}`);

      const { passwordHash, deletedAt, ...userWithoutPassword } = user;

      return {
        user: {
          ...userWithoutPassword,
          teamId: user.teamId || undefined,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          teamId: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: {
    id: string;
    email: string;
    role: UserRole;
    teamId?: string | null;
  }): Promise<AuthTokens> {
    // Access token payload
    const accessPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
      type: 'access',
    };

    // Refresh token payload
    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
    };

    // Generate tokens
    const accessToken = jwt.sign(accessPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwtSecret, {
      expiresIn: config.refreshTokenExpiresIn,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    // Calculate expiry time in seconds
    const expiresIn = this.parseExpiryTime(config.jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiry time string to seconds
   */
  private parseExpiryTime(expiryString: string): number {
    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * multipliers[unit];
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) return false;

    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const isValid = await this.verifyPassword(userId, oldPassword);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info(`Password changed for user: ${userId}`);
  }
}

export const authService = new AuthService();
