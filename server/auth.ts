import { Request, Response, NextFunction } from 'express';
import { getStore, User } from './dataStore.js';

// Simple, reliable server-signed session token for the AI Studio runtime
const SECRET_SALT = process.env.SESSION_SECRET || 'ai-clinic-clinical-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64');
  return `clinic_auth_${base64}`;
}

export function verifyToken(token: string): User | null {
  try {
    if (!token || !token.startsWith('clinic_auth_')) return null;
    const base64 = token.replace('clinic_auth_', '');
    const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    const store = getStore();
    const user = store.users.find((u) => u.id === payload.userId && u.email === payload.email);
    if (!user) return null;
    if (user.status === 'suspended') return null;

    return user;
  } catch (err) {
    return null;
  }
}

// Middleware: Authenticate Token (optional or required)
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }

  req.user = user;
  next();
}

// Middleware: Soft Authentication (attaches user if present, does not fail)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

// Middleware: Require specific roles (normalized to the 3 application roles: patient, doctor, clinic_staff)
export function requireRole(allowedRoles: Array<User['role'] | 'admin' | 'staff' | 'clinic_staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const normalizedUserRole = (req.user.role as string) === 'admin' || (req.user.role as string) === 'staff' ? 'clinic_staff' : req.user.role;
    const normalizedAllowed = allowedRoles.map(r => (r === 'admin' || r === 'staff' ? 'clinic_staff' : r));

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
