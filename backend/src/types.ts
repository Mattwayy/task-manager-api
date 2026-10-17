export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
