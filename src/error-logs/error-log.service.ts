import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDocument } from './error-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectModel(Log.name) private readonly model: Model<LogDocument>,
  ) {}

  async logError(
    exception: Error,
    message: string,
    status: number,
    ip?: string,
    request?: any,
  ): Promise<void> {
    try {
      const errorEntry = await this.model.create({
        message: message,
        name: exception.name,

        stack: exception.stack,
        url: request?.url || 'Unknown',
        method: request?.method || 'Unknown',
        ip: ip == '' ? null : ip,
        status,
        device: request?.headers['user-agent'] || 'Unknown',
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }
}
