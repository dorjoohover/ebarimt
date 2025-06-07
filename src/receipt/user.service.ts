import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { UserDto } from 'src/auth/dto/create-auth.dto';
import { User, UserDocument } from 'src/schema/users.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}
  private refreshing: Promise<string> | null = null;
  public async loginEbarimt(dto: UserDto): Promise<{
    token: string;
    expiredIn: number;
    accessToken?: string;
  }> {
    const now = Date.now();

    if (now < dto.expiresAt && dto.accessToken) {
      return {
        token: dto.token,
        accessToken: dto.accessToken,
        expiredIn: Math.floor((dto.expiresAt - now) / 1000),
      };
    }

    if (this.refreshing) {
      const token = await this.refreshing;
      return {
        token,
        expiredIn: Math.floor((dto.expiresAt - Date.now()) / 1000),
      };
    }
    this.refreshing = this._getNewToken(dto.token).finally(() => {
      this.refreshing = null;
    });

    const accessToken = await this.refreshing;
    return {
      accessToken: accessToken,
      token: dto.token,
      expiredIn: Math.floor((dto.expiresAt - Date.now()) / 1000),
    };
  }

  private async _getNewToken(token: string): Promise<string> {
    const now = Date.now();
    if (!token) throw new UnauthorizedException();
    const user = await this.model.findOne({
      token,
    });
    if (!user)
      throw new HttpException('Хэрэглэгч олдсонгүй', HttpStatus.UNAUTHORIZED);
    const url =
      'https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token';
    const params = new URLSearchParams({
      grant_type: user.type,
      client_id: user.clientId,
      username: user.username,
      password: user.password,
    });

    try {
      const res = await firstValueFrom(
        this.httpService.post(url, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      const tokenData = res.data;
      await this.model.findOneAndUpdate(
        {
          token,
        },
        {
          accessToken: tokenData.access_token,
          expiresAt: now + tokenData.expires_in * 1000,
        },
      );

      return tokenData.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Authentication failed',
        500,
      );
    }
  }
}
