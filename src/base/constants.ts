export const RECEIPT_TYPE = {
  10: 'B2C_RECEIPT',
  20: 'B2B_RECEIPT',
  30: 'B2C_INVOICE',
  40: 'B2B_INVOICE',
};
export const TAX_TYPE = {
  10: 'VAT_ABLE',
  20: 'VAT_FREE',
  30: 'VAT_ZERO',
  40: 'NO_VAT',
};
export const BARCODE_TYPE = {
  10: 'UNDEFINED',
  20: 'GS1',
  30: 'ISBN',
};
// CASH, PAYMENT_CARD, BONUS_CARD_TEST, EMD, BANK_TRANSFER
export const PAYMENT_TYPE = {
  10: 'BANK_TRANSFER',
  20: 'CASH',
  30: 'PAYMENT_CARD',
};

export const PAYMENT_STATUS = {
  10: 'PAID',
  20: 'PAY',
  30: 'REVERSED',
  40: 'ERROR',
};

export enum RECEIPT {
  'B2C_RECEIPT' = 10,
  'B2B_RECEIPT' = 20,
  'B2C_INVOICE' = 30,
  'B2B_INVOICE' = 40,
}

export enum TAX {
  'VAT_ABLE' = 10,
  'VAT_FREE' = 20,
  'VAT_ZERO' = 30,
  'NO_VAT' = 40,
}
export enum BARCODE {
  'UNDEFINED' = 10,
  'GS1' = 20,
  'ISBN' = 30,
}
