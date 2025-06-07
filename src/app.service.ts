import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { BarimtDto, UserDto } from './auth/dto/create-auth.dto';
import axios, { AxiosError } from 'axios';
import { BASE_URL, LOCAL } from './utils';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Receipt, ReceiptDocument } from './schema/receipt.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
    @InjectModel(Receipt.name) private readonly receipt: Model<ReceiptDocument>,
    private readonly httpService: HttpService,
  ) {}
  public async create(dto: UserDocument) {
    return await this.model.create(dto);
  }

  // public async loginEbarimt(dto: UserDto) {
  //   const url =
  //     'https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token';
  //   const d = new URLSearchParams({
  //     grant_type: dto.grant_type,
  //     client_id: dto.client_id,
  //     username: dto.username,
  //     password: dto.password,
  //   });
  //   try {
  //     const res = await firstValueFrom(
  //       this.httpService.post(url, d, {
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       }),
  //     );

  //     if (res.status != 200)
  //       throw new HttpException(res.data, HttpStatus.BAD_REQUEST);
  //     const data = res.data;
  //     return {
  //       token: data.access_token,
  //       expiredIn: data.expires_in,
  //     };
  //   } catch (error) {
  //     const axiosError = error as AxiosError;
  //     throw new HttpException(
  //       axiosError.response?.data || 'Authentication failed',
  //       500,
  //     );
  //   }
  // }

  async restReceipt(dto: any, token: string) {
    try {
      return `${dto}${Date.now()}`;
      console.log(dto);
      if (!dto.receipts || dto.receipts.length == 0)
        throw new HttpException('Мэдээлэл дутуу', HttpStatus.BAD_REQUEST);
      const receipts = await Promise.all(
        dto.receipts.map(async (rec) => {
          const items = await Promise.all(
            rec.items.map((item) => {
              const {
                taxProductCode,
                qty,
                unitPrice,
                totalVAT,
                totalCityTax,
                ...body
              } = item;
              // totalVAT 0 || 10
              const vat = Math.round((unitPrice / 100) * totalVAT);
              // totalCityTax 0 || 2
              const tax = Math.round((unitPrice / 100) * totalCityTax);
              const uPrice = unitPrice + vat + tax;
              const totalAmount = uPrice * qty;

              if (rec.taxType == 'VAT_FREE' || rec.taxType == 'VAT_ZERO')
                return {
                  ...body,
                  totalVAT: vat * qty,
                  totalCityTax: tax * qty,
                  totalAmount: totalAmount,
                  unitPrice: uPrice,
                  taxProductCode: taxProductCode,
                };
              return {
                ...body,
                totalVAT: vat * qty,
                totalCityTax: tax * qty,
                totalAmount: totalAmount,
                unitPrice: uPrice,
              };
            }),
          );
          const amount = items.reduce((a, b) => a + b.totalAmount, 0);
          const vat =
            rec.taxType != 'VAT_ABLE'
              ? 0
              : items.reduce((a, b) => a + b.totalVAT, 0);
          const tax = items.reduce((a, b) => a + b.totalCityTax, 0);
          return {
            ...rec,
            items,
            totalAmount: amount,
            totalVAT: vat,
            totalCityTax: tax,
          };
        }),
      );

      const totalAmount = receipts.reduce((a, b) => a + b.totalAmount, 0);
      const totalVAT = receipts.reduce((a, b) => a + b.totalVAT, 0);
      const totalCityTax = receipts.reduce((a, b) => a + b.totalCityTax, 0);

      const body = {
        branchNo: dto.branchNo,
        districtCode: dto.districtCode,
        merchantTin: dto.merchantTin,
        totalAmount,
        totalVAT,
        totalCityTax,
        posNo: dto.posNo,
        type: dto.type,
        consumerNo: dto.consumerNo,
        reportMonth: dto.reportMonth ?? null,
        receipts,
        payments: dto.payments,
      };
      const res = await axios.post(
        `${LOCAL}rest/receipt`,
        JSON.stringify(body),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // await this.saveReceipt(res.data, dto.token);
      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  }


 
}
