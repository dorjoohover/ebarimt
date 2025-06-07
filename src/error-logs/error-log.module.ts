import { Module } from '@nestjs/common';
import { Log, LogSchema } from './error-log.schema';
import { ErrorLogService } from './error-log.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [ErrorLogService],
  exports: [ErrorLogService],
})
export class ErrorLogModule {}
