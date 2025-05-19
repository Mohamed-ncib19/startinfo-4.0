import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'a8d4f7e2c6b9a1d5e8f3c7b2a9d6e5f4c3b2a1d8e7f6c5b4a3d2e1f8c7b6a5';
const SALT_ROUNDS = 10;

export interface AuthToken {
  userId: number;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload: AuthToken = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthToken {
  return jwt.verify(token, JWT_SECRET) as AuthToken;
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  const verifyToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      verifyToken,
      profile: {
        create: {} // Create an empty profile
      }
    },
  });

  return { user, verifyToken };
}

export async function verifyUser(token: string) {
  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  });

  if (!user) {
    throw new Error('Invalid verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verified: true,
      verifyToken: null,
    },
  });

  return user;
}

/**
 * Logs in a user by saving the email in local storage.
 * @param {string} email - The user's email.
 * @returns {boolean} - True if login is successful.
 */
export const login = (email: string): boolean => {
  localStorage.setItem('userEmail', email);
  return true;
};

/**
 * Signs up a user by saving the email and password in local storage.
 * @returns {boolean} - True if signup is successful.
 */
export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = generateVerificationToken();
  const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExp,
    },
  });

  return resetToken;
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return user;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  console.log('=== Authentication Middleware ===');
  console.log('Headers:', {
    ...req.headers,
    authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined
  });
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Token exists:', !!token);
  
  if (!token) {
    console.log('No token provided');
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  try {
    console.log('Attempting to verify token...');
    const decoded = verifyToken(token);
    console.log('Token verified successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    console.log('User attached to request:', req.user);
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
