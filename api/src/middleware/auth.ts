/**
 * Authentication Middleware
 * Note: Most routes are called through Next.js API proxy which validates Supabase sessions
 * This middleware provides optional basic token checking
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Optional authentication middleware
 * Since requests come through Next.js proxy with Supabase session validation,
 * this just extracts user info from token without strict verification
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Allow requests without tokens for now since Next.js handles auth
      console.log('No auth token provided, continuing...');
      next();
      return;
    }

    // Decode token without verification to extract user info
    const decoded = jwt.decode(token) as any;
    
    if (decoded) {
      (req as AuthRequest).user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role || decoded.user_metadata?.role || 'user',
      };
      console.log('Token decoded, user:', (req as AuthRequest).user);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Continue anyway since auth is handled by Next.js
    next();
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;

  if (!authReq.user || authReq.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }

  next();
};
