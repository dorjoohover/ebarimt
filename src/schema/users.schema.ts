import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Receipt, ReceiptSchema } from './receipt.schema';

@Schema({
  timestamps: true,
})
export class User {
  _id?: string;
  @Prop({ type: String })
  // like system token
  token: string;
  @Prop({ type: String })
  // ebarimt token
  accessToken: string;

  @Prop({ type: String })
  // expiredDate
  date: Date;

  @Prop({ type: String })
  type: string;
  @Prop({ type: String })
  clientId: string;
  @Prop({ type: String })
  username: string;
  @Prop({ type: String })
  password: string;
  @Prop({ type: String })
  district: string;
  @Prop({ type: String })
  regNo: string;
  @Prop({ type: String })
  tin: string;
  @Prop({ type: Number })
  expiresAt: number;

  @Prop()
  role: string;
  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
