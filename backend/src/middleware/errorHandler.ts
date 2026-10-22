import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const code = err.code || (statusCode === 429 ? 'RATE_LIMITED' : statusCode === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR');
  const message = err.message || 'An unexpected server error occurred';

  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}
