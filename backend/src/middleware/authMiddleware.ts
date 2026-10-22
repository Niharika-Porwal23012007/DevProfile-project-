import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { config } from '../config';
import { hashApiKey } from '../services/cryptoService';
import { AppError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  github_username?: string;
  leetcode_username?: string;
  public_slug?: string;
  is_public: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Validates JWT tokens for web frontend or Personal API Keys for the VS Code extension
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check for development bypass header if in development mode
    if (config.nodeEnv === 'development' && req.headers['x-demo-user']) {
      const demoUser = db.prepare('SELECT id, name, email, github_username, leetcode_username, public_slug, is_public FROM users LIMIT 1').get() as any;
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }
    return next(new AppError('UNAUTHORIZED', 'Authorization token required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1].trim();

  // 1. Check if token is an extension API key (e.g. devprof_...)
  if (token.startsWith('devprof_')) {
    const hashed = hashApiKey(token);
    const user = db.prepare('SELECT id, name, email, github_username, leetcode_username, public_slug, is_public FROM users WHERE api_key_hash = ?').get(hashed) as any;
    if (!user) {
      return next(new AppError('INVALID_API_KEY', 'Invalid or revoked extension API key.', 401));
    }
    req.user = user;
    return next();
  }

  // 2. Otherwise verify as JWT
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    const user = db.prepare('SELECT id, name, email, github_username, leetcode_username, public_slug, is_public FROM users WHERE id = ?').get(payload.id) as any;
    if (!user) {
      return next(new AppError('USER_NOT_FOUND', 'User session is no longer valid.', 401));
    }
    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('TOKEN_EXPIRED', 'Session expired. Please log in again.', 401));
    }
    return next(new AppError('INVALID_TOKEN', 'Malformed or invalid authentication token.', 401));
  }
}
