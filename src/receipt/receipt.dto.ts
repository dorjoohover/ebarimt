import { ApiProperty } from '@nestjs/swagger';

export class DeleteReceiptDto {
  @ApiProperty({ type: Number })
  id: number;
}

export class ReceiptDto {
  @ApiProperty({ type: Number })
  totalAmount: number;
  @ApiProperty({ type: Number })
  paidAmount: number;
  @ApiProperty({ type: String })
  pos: string;
  @ApiProperty({ type: String })
  tin: string;

  @ApiProperty({ type: Number })
  totalVAT: number;
  @ApiProperty({ type: Number })
  totalCityTax: number;

  @ApiProperty({ type: String })
  lottery: string;
  @ApiProperty({ type: String })
  qrdata: string;
  // @ApiProperty({ type: String })
  // qrData: string;
  @ApiProperty({ type: String })
  status: string;
  @ApiProperty({ type: Number })
  userId: number;
  @ApiProperty({ type: Number })
  service: number;
  @ApiProperty({ type: String })
  date: Date;
  @ApiProperty({ type: Boolean })
  easy: boolean;
  @ApiProperty({ type: String })
  id: string;
}

export class ReceiptItemsDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  barCode?: string;
  // UNDEFINED | GS1 | ISBN
  @ApiProperty()
  barCodeType?: string;
  // Бүтээгдэхүүн, үйлчилгээний ангиллын код
  @ApiProperty()
  classificationCode?: string;
  @ApiProperty()
  taxProductCode?: string;
  @ApiProperty()
  measureUnit?: string;
  // quantity
  @ApiProperty()
  qty: number;
  @ApiProperty()
  unitPrice: number;
  totalVAT?: number;
  totalCityTax?: number;
  totalAmount?: number;
  // em emnelegt heregtei
  // "data": {
  //     // "lotNo": "string",
  //     "stockQR": [
  //         "A17F974BE488***CE0536F50A8C057A7"
  //     ]
  // }
}
export class ReceiptsDto {
  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  // VAT_ABLE | VAT_FREE | VAT_ZERO | NO_VAT
  @ApiProperty()
  taxType?: string;
  // ttd
  @ApiProperty()
  merchantTin?: string;

  @ApiProperty({ isArray: true, type: ReceiptItemsDto })
  items: ReceiptItemsDto[];
}

export class PaymentDto {
  // Төлбөрийн хэлбэрийн код CASH | PAYMENT_CARD
  @ApiProperty()
  code: string;
  //   Төлбөр хийж гүйцэтгэх гуравдагч системийн код idk
  //   exchangeCode: string
  //   Төлбөрийн хэлбэрийн төлөв PAID
  @ApiProperty()
  status: string;
  @ApiProperty()
  paidAmount: number;
  //   data: {};
}

export class BarimtDto {
  // branch number default 000 || 001
  @ApiProperty()
  branchNo?: string;
  @ApiProperty()
  paidAmount: number;
  // ttd
  // merchantTin?: string;
  // get from ebarimt
  // districtCode?: string;
  // get from local now
  @ApiProperty()
  posNo?: string;
  // Худалдан авагчийн ТТД
  regNo?: string;
  // Худалдан авагч иргэний ebarimt-н бүртгэлийн дугаар
  // consumerNo?: string | null;
  // Баримтын төрөл (invoice don't need currently)
  // B2C_RECEIPT | B2B_RECEIPT
  @ApiProperty({ default: 10 })
  type?: number;
  // if null ? current month
  @ApiProperty()
  reportMonth: string | null;
  // Баримтын ДДТД-ыг давхцуулахгүйн тулд олгох дотоод дугаарлалт. Тухайн өдөртөө дахин давтагдашгүй дугаар байна (was 21length)
  @ApiProperty()
  billIdSuffix: string;
  // totalAmount: number
  // totalVat: number
  // totalCityTax: number
  // "inactiveId": "123456789123456789123456789123456",
  // "invoiceId": "123456789123456789123456789123456",
  // "data": {},
  // Дэд төлбөрийн баримтууд
  @ApiProperty({ isArray: true, type: ReceiptsDto })
  receipts: ReceiptsDto[];
  @ApiProperty({ isArray: true, type: PaymentDto })
  payments: PaymentDto[];
}

export class BarimtResponseDto {
  // ddtd
  id: string;
  // posid
  posId: number;
  // status
  status: string;
  // message
  message: string;
  // qrData
  qrData: string;
  // sugalaanii dugaar
  lottery: string;
  // barimt hewlesen ognoo date
  date: string;
  //
  easy: string;
  //
  receipts: BarimtRecceiptResponseDto[];
}

export class BarimtRecceiptResponseDto {
  // ded ddtd
  id: string;
  // account id
  bankAccountId: number;
}
