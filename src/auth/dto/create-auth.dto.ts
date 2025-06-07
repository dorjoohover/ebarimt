import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ default: 'АА10010110' })
  username: string;
  @ApiProperty({ default: 'Test@123' })
  password: string;
}

export class UserDto {
  grant_type?: string;
  client_id?: string;
  username?: string;
  password?: string;
  tin?: string;
  regNo?: string;
  district?: string;
  expiresAt?: number;
  accessToken?: string;
  token?: string;
}
export class ReceiptItemsDto {
  name: string;
  barCode: string;
  // UNDEFINED | GS1 | ISBN
  barCodeType: string;
  // Бүтээгдэхүүн, үйлчилгээний ангиллын код
  classificationCode: string;
  taxProductCode: string;
  measureUnit: string;
  // quantity
  qty: number;
  unitPrice: number;
  totalVAT: number;
  totalCityTax: number;
  totalAmount: number;
  // em emnelegt heregtei
  // "data": {
  //     // "lotNo": "string",
  //     "stockQR": [
  //         "A17F974BE488***CE0536F50A8C057A7"
  //     ]
  // }
}
export class ReceiptsDto {
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  // VAT_ABLE | VAT_FREE | VAT_ZERO | NO_VAT
  taxType: string;
  // ttd
  merchantTin: string;

  items: ReceiptItemsDto[];
}

export class PaymentDto {
  // Төлбөрийн хэлбэрийн код CASH | PAYMENT_CARD
  code: string;
  //   Төлбөр хийж гүйцэтгэх гуравдагч системийн код idk
  //   exchangeCode: string
  //   Төлбөрийн хэлбэрийн төлөв PAID
  status: string;
  paidAmount: number;
  //   data: {};
}

export class BarimtDto {
  // branch number default 000 || 001
  branchNo: string;
  // ttd
  merchantTin: string;
  // get from ebarimt
  districtCode: string;
  // get from local now
  posNo: string;
  // Худалдан авагчийн ТТД
  customerTin: string;
  // Худалдан авагч иргэний ebarimt-н бүртгэлийн дугаар
  consumerNo: string | null;
  // Баримтын төрөл (invoice don't need currently)
  // B2C_RECEIPT | B2B_RECEIPT
  type: string;
  // if null ? current month
  reportMonth: string | null;
  // Баримтын ДДТД-ыг давхцуулахгүйн тулд олгох дотоод дугаарлалт. Тухайн өдөртөө дахин давтагдашгүй дугаар байна (was 21length)
  billIdSuffix: string;
  // totalAmount: number
  // totalVat: number
  // totalCityTax: number
  // "inactiveId": "123456789123456789123456789123456",
  // "invoiceId": "123456789123456789123456789123456",
  // "data": {},
  // Дэд төлбөрийн баримтууд
  receipts: ReceiptsDto[];
  payments: PaymentDto[];
}
