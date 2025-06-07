import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { jwtConstants } from 'src/utils';
import { AppService } from 'src/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/users.schema';
import { Receipt, ReceiptSchema } from 'src/schema/receipt.schema';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Receipt.name, schema: ReceiptSchema },
    ]),
    HttpModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, AppService],
  exports: [AuthService],
})
export class AuthModule {}
