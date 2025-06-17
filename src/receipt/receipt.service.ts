import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from 'src/schema/receipt.schema';
import {
  BarimtDto,
  BarimtResponseDto,
  DeleteReceiptDto,
  ReceiptDto,
} from './receipt.dto';
import axios from 'axios';
import { LOCAL } from 'src/utils';
import { UserService } from './user.service';
import * as QRCode from 'qrcode';
import { UserDto } from 'src/auth/dto/create-auth.dto';
import { User, UserDocument } from 'src/schema/users.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BARCODE,
  BARCODE_TYPE,
  RECEIPT,
  TAX,
  TAX_TYPE,
} from 'src/base/constants';
import { format } from 'date-fns';
@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel(Receipt.name) private readonly model: Model<ReceiptDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private user: UserService,
  ) {}

  async create(dto: BarimtDto, user: User) {
    const barimt = await this.getBarimt(user._id, dto.billIdSuffix);
    if (barimt) return barimt;

    const d = {
      // branchNo: '001',
      branchNo: dto.branchNo,
      districtCode: user.district,
      merchantTin: user.tin,
      posNo: '10009446',
      // ?
      // consumerNo: '10038071',
      type: RECEIPT[dto.type],
      // type: 'B2C_RECEIPT',
      billIdSuffix: dto.billIdSuffix,
      // billIdSuffix: '100100015121212121111',
      reportMonth: null,
      receipts: dto.receipts.map((r) => {
        return {
          taxType: TAX[r.taxType] ?? TAX_TYPE[10],
          merchantTin: user.tin,
          items: r.items.map((r) => {
            return {
              name: r.name,
              barCode: r.barCode,
              barCodeType: BARCODE[r.barCodeType] ?? BARCODE_TYPE[10],
              classificationCode: r.classificationCode ?? '8122100',
              // "taxProductCode": "string",
              measureUnit: r.measureUnit ?? 'багц',
              qty: r.qty,
              unitPrice: r.unitPrice,
              totalVAT: r.totalVAT ?? 10,
              totalCityTax:
                r.totalCityTax == 0 || r.totalCityTax == null
                  ? null
                  : r.totalCityTax,
            };
          }),
        };
      }),
      payments: dto.payments,
    };
    const { accessToken } = await this.user.loginEbarimt(user);
    // return token;
    try {
      if (!d.receipts || d.receipts.length == 0)
        throw new HttpException('Мэдээлэл дутуу', HttpStatus.BAD_REQUEST);
      const { regNo, ...payload } = dto;
      const customerTin =
        regNo && dto.type == RECEIPT.B2B_RECEIPT
          ? await this.lookupTTD(dto.regNo)
          : null;
      const receipts = await Promise.all(
        d.receipts.map(async (rec) => {
          const items = await Promise.all(
            rec.items.map((item) => {
              const {
                // taxProductCode,
                qty,
                unitPrice,
                totalVAT,
                totalCityTax,
                ...body
              } = item;
              let uPrice =
                Math.round(
                  (unitPrice /
                    (1 +
                      (totalVAT + (totalCityTax == null ? 0 : totalCityTax)) /
                        100)) *
                    100,
                ) / 100;
              // totalVAT 0 || 10
              const vat = Math.round(uPrice * totalVAT) / 100;
              // totalCityTax 0 || 2
              const tax =
                totalCityTax == null
                  ? totalCityTax
                  : (Math.round(uPrice * totalCityTax) / 100) * qty;
              const totalAmount = unitPrice * qty;
              console.log(vat, tax, uPrice, unitPrice);
              if (rec.taxType == TAX_TYPE[20] || rec.taxType == TAX_TYPE[30])
                return {
                  ...body,
                  totalVAT: vat * qty,
                  totalCityTax: tax,
                  totalAmount: totalAmount,
                  unitPrice: unitPrice,
                  // taxProductCode: taxProductCode,
                };
              return {
                ...body,
                totalVAT: vat * qty,
                totalCityTax: tax,
                totalAmount: totalAmount,
                unitPrice: unitPrice,
              };
            }),
          );
          const amount = items.reduce((a, b) => a + b.totalAmount, 0);
          const vat =
            rec.taxType != TAX_TYPE[10]
              ? 0
              : items.reduce((a, b) => a + b.totalVAT, 0);
          const tax = items.reduce((a, b) => {
            const tax = b.totalCityTax ?? 0;
            return a + tax;
          }, 0);

          return {
            ...rec,
            items,
            customerTin,
            totalAmount: amount,
            totalVAT: vat,
            totalCityTax: tax == 0 ? null : tax,
          };
        }),
      );

      const totalAmount = receipts.reduce((a, b) => a + b.totalAmount, 0);
      const totalVAT = receipts.reduce((a, b) => a + b.totalVAT, 0);
      const totalCityTax = receipts.reduce((a, b) => {
        const tax = b.totalCityTax ?? 0;
        return a + tax;
      }, 0);
      const body = {
        branchNo: d.branchNo,
        districtCode: d.districtCode,
        merchantTin: d.merchantTin,
        totalAmount,
        totalVAT,
        customerTin,
        totalCityTax: totalCityTax == 0 ? null : totalCityTax,
        posNo: d.posNo,
        type: d.type,
        // consumerNo: d.consumerNo,
        reportMonth: d.reportMonth ?? null,
        receipts,
        payments: d.payments,
      };
      const res = await axios.post(
        `${LOCAL}rest/receipt`,
        JSON.stringify(body),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data: any = res.data;
      const qrdata = await this.generateQrImage(data.qrData);
      const barimt = await this.save(
        {
          ...data,
          pos: res.data.posId,
          tin: res.data.merchantTin,
          paidAmount: dto.paidAmount,
          totalAmount: body.totalAmount,
          qrdata: qrdata,
        },
        user.token,
        dto.billIdSuffix,
        user._id,
      );
      console.log(barimt);

      if (res.status != 200) throw new HttpException('', 500);

      return {
        ...barimt,
        qrData: qrdata,
      };
    } catch (error) {
      console.log(error.response.data.message);
      // console.log(error.message);
    }
  }

  async lookupTTD(regNo: string) {
    try {
      console.log(
        `${process.env.EBARIMT_API}info/check/getTinInfo?regNo=${regNo}`,
      );
      const res = await axios.get(
        `${process.env.EBARIMT_API}info/check/getTinInfo?regNo=${regNo}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      // console.log(res.data);
      if (res.data.status == 200) return res.data.data;
    } catch (error) {
      console.log(error);
    }
  }
  async save(dto: ReceiptDto, token: string, key: string, id: string) {
    try {
      const user = await this.userModel.findOne({ token });
      let res = await this.getBarimt(user._id, key);
      if (res != null) {
        return {
          totalAmount: res.totalAmount,
          totalCityTax: res.tax,
          lottery: res.lottery,
          key: res.key,
          status: res.status,
          ddtd: res.ddtd,
          pos: res.pos,
          noat: res.noat,
          date: res.date,
          easy: res.easy,
          tin: res.tin,
          qrdata: res.qrdata,
        };
      }
      const body: Receipt = {
        date: dto.date,
        easy: dto.easy,
        lottery: dto.lottery,

        qrdata: dto.qrdata,
        pos: dto.pos,
        status: dto.status,
        totalAmount: dto.totalAmount,
        totalCityTax: dto.totalCityTax,
        totalVAT: dto.totalVAT,
        ddtd: dto.id,
        noat: dto.totalVAT,
        tax: dto.totalCityTax,
        key: key,
        tin: dto.tin,
        user: new Types.ObjectId(id),
      };

      const barimt = await this.model.create(body);
      console.log(barimt, token);
      await this.userModel
        .findOneAndUpdate(
          {
            token,
          },
          {
            $push: { receipts: barimt._id },
          },
        )
        .exec();
      return body;
    } catch (error) {
      throw error;
    }
  }

  async generateQrImage(data: string): Promise<string> {
    try {
      const qr = await QRCode.toDataURL(data);
      return qr; // base64 PNG image (you can show this in <img src="...">)
    } catch (err) {
      throw new Error('QR code generation failed');
    }
  }

  async getBarimt(u: string, id: string) {
    try {
      const barimt = await this.model
        .findOne({
          key: id,
          user: u,
        })
        .populate('user');

      if (!barimt) {
        return null;
        // throw new HttpException(
        //   'И-баримт бүртгэгдээгүй байна.',
        //   HttpStatus.NOT_FOUND,
        // );
      }
      console.log(barimt);
      const { user } = barimt;

      return {
        tin: user.tin,
        lottery: barimt.lottery,
        noat: barimt.noat,
        totalCityTax: barimt.totalCityTax,
        totalAmount: barimt.totalAmount,
        ddtd: barimt.ddtd,
        date: barimt.date,
        totalVAT: barimt.totalVAT,
        key: barimt.key,
        name: user.name,
        tax: barimt.tax,
        pos: barimt.pos,
        status: barimt.status,
        easy: barimt.easy,
        qrdata: barimt.qrdata,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async send() {
    try {
      const response = await axios.get(`${LOCAL}rest/sendData`, {
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteReceipt(dto: DeleteReceiptDto) {
    // Баримт хэвлэсэн огноо "yyyy-MM-dd HH:mm:ss" форматтай огноо
    try {
      const barimt = await this.model.findOne({
        key: dto.id,
        // user: 
      });
      const date = format(new Date(barimt.createdAt), 'yyyy-MM-dd HH:mm:ss');
      const response = await axios.delete(`${LOCAL}rest/receipt`, {
        data: {
          id: barimt.ddtd,
          date,
        },
      });
      console.log(response.data);
      // this.model.deleteMany({
      //   key: dto.id,
      // });
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Алдаа гарлаа', 500);
    }
  }
  async getInformation() {
    try {
      const response = await axios.get(`${LOCAL}rest/info`, {
        headers: {
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
