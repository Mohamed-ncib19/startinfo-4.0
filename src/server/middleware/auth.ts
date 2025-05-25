import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthToken {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'a8d4f7e2c6b9a1d5e8f3c7b2a9d6e5f4c3b2a1d8e7f6c5b4a3d2e1f8c7b6a5') as AuthToken;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}; 