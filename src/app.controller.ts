import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { AuthService } from './auth/auth.service';
import { BarimtDto, LoginDto, UserDto } from './auth/dto/create-auth.dto';
import { AppService } from './app.service';
import { Public } from './auth/guards/jwt/jwt-auth-guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiHeader({
  name: 'x-api-key',
  required: true,
})
@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly service: AppService,
  ) {}
  @ApiBearerAuth('access-token')
  @Post('create')
  async createUser(@Body() dto: UserDto, @Request() { user }) {
    if (user.role == undefined || !user.role)
      throw new HttpException('Хандах эрхгүй байна.', HttpStatus.BAD_REQUEST);
    await this.authService.createUser(dto);
  }
  // @Post('process')
  // async process(@Body() dto: BarimtDto, @Req() req: Request) {
  //   const { user } = await this.check(req);

  //   return {
  //     message: `${dto.merchantTin} user processing job added to queue`,
  //   };
  // }
  @Public()
  @Post('login')
  async getToken(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
