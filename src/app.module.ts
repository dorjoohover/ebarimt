import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { User, UserSchema } from './schema/users.schema';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Receipt, ReceiptSchema } from './schema/receipt.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { ErrorLogModule } from './error-logs/error-log.module';
import { ReceiptModule } from './receipt/receipt.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt/jwt-auth-guard';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './utils';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb+srv://dorjoohover:dorjooX0@cluster0.lg7cc.mongodb.net/ebarimt?retryWrites=true&w=majority',
    ),

    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Receipt.name,
        schema: ReceiptSchema,
      },
    ]),
    ErrorLogModule,
    ReceiptModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
