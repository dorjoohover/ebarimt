import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './users.schema';

@Schema({
  timestamps: true,
})
export class Receipt {
  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: Number })
  totalVAT: number;
  @Prop({ type: Number })
  totalCityTax: number;

  @Prop({ type: String })
  lottery: string;
  @Prop({ type: String })
  key: string;
  @Prop({ type: String })
  pos: string;
  @Prop({ type: String })
  tin: string;
  // @Prop({ type: String })
  // qrData: string;
  @Prop({ type: String })
  status: string;
  @Prop({ type: String })
  ddtd: string;
  @Prop({ type: Number })
  noat: number;
  @Prop({ type: Number })
  tax: number;
  @Prop({ type: String })
  date: Date;
  @Prop({ type: Boolean })
  easy: boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User | any;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
export type ReceiptDocument = HydratedDocument<Receipt>;
