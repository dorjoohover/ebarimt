import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receipt, ReceiptSchema } from 'src/schema/receipt.schema';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { User, UserSchema } from 'src/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Receipt.name, schema: ReceiptSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, UserService],
})
export class ReceiptModule {}
