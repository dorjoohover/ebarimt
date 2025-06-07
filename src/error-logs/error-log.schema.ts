import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Log {
  @Prop({ type: String })
  message: string;
  @Prop({ type: String })
  stack: string;
  @Prop({ type: String })
  url: string;
  @Prop({ type: String })
  method: string;
  @Prop({ type: Number })
  status: number;
  @Prop({ type: String })
  ip: string;
  @Prop({ type: String })
  device: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
export type LogDocument = HydratedDocument<Log>;
