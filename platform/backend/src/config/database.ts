// Prisma Database Configuration
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma warnings
prisma.$on('warn', (e) => {
  logger.warn(`Prisma warning: ${e.message}`);
});

// Log Prisma errors
prisma.$on('error', (e) => {
  logger.error(`Prisma error: ${e.message}`);
});

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

export { prisma };
export default prisma;
