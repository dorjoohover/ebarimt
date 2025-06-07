import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { AppService } from 'src/app.service';
import { User, UserDocument } from 'src/schema/users.schema';
import { UserDto } from './dto/create-auth.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private service: AppService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async checkToken(req: Request, dto: UserDto) {
    let user = !dto?.username ? null : await this.getUser(dto);
    const token = req?.headers?.['authorization']?.split(' ')?.[1];
    if (!token && !user) {
      throw new HttpException('Хандах эрхгүй байна.', HttpStatus.BAD_REQUEST);
    }
    console.log(token)
    user = await this.model.findOne({ token });
    if (!user)
      throw new HttpException(
        'Бүртгэлгүй хэрэглэгч байна',
        HttpStatus.FORBIDDEN,
      );
    return {
      role: user.role == (process.env.ROLE as string),
      user,
    };
  }
  generateToken() {
    return `${Date.now()}${Math.random().toString(36).substr(2)}`;
  }
  async getUser(dto: UserDto) {
    return await this.model.findOne({
      password: dto.password,
      username: dto.username,
    });
  }

  async login(dto: UserDto) {
    const user = await this.getUser(dto);
    const accessToken = await this.generateJwtToken(user);

    return {
      accessToken,
      expiredIn: 3600 * 24,
    };
  }

  async generateJwtToken(result) {
    return await this.jwtService.sign(
      {
        user: result,
      },
      { expiresIn: '1d' },
    );
  }

  async findUserByToken(token: string) {
    return await this.model.findOne({
      token,
    });
  }

  async createUser(dto: UserDto) {
    let user = await this.getUser(dto);
    if (user)
      throw new HttpException(
        'Бүртгэлтэй хэрэглэгч байна.',
        HttpStatus.BAD_REQUEST,
      );
    const token = this.generateToken();
    user = await this.model.create({
      token,
      password: dto.password,
      clientId: dto.client_id,
      username: dto.username,
      type: dto.grant_type,
      tin: dto.tin,
      regNo: dto.regNo,
      district: dto.district,
    });
    return {
      user,
      token,
    };
  }

  // async checkUser(dto: UserDto) {
  //   try {
  //     let user = await this.model.findOne({
  //       username: dto.username,
  //       clientId: dto.client_id,
  //     });

  //     let token: string | null = user?.accessToken || null;

  //     if (!user) {
  //       const res = await this.service.loginEbarimt(dto);
  //       const generatedToken = this.generateToken();

  //       user = await this.model.create({
  //         token: generatedToken,
  //         clientId: dto.client_id,
  //         password: dto.password,
  //         accessToken: res.token,
  //         type: dto.grant_type,
  //         username: dto.username,
  //         date: new Date(Date.now() + res.expiredIn * 1000),
  //       });

  //       token = res.token;
  //     } else if (
  //       !user.accessToken ||
  //       new Date(user.date).getTime() < Date.now()
  //     ) {
  //       const res = await this.service.loginEbarimt({
  //         username: user.username,
  //         password: user.password,
  //         client_id: user.clientId,
  //         grant_type: user.type,
  //       });

  //       user.accessToken = res.token;
  //       user.date = new Date(Date.now() + res.expiredIn * 1000);
  //       await user.save();

  //       token = res.token;
  //     }
  //     return token;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async refreshEbarimtToken(refreshToken: string) {
    try {
      const response = await axios.post(
        'https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: 'vatps',
          refresh_token: refreshToken,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Failed to refresh token:',
        error.response?.data || error.message,
      );
      return null;
    }
  }
}
