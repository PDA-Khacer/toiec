import {model, property, Entity} from '@loopback/repository';
import {PaymentMethod} from './setting-prices.model';

export enum BillPaymentStatus {
  DRAFT = 'draft',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAIL = 'fail',
}

@model({
  settings: {
    postgresql: {
      table: 'bill-payment',
    },
  },
})
export class BillPayment extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'code',
  })
  code?: string;

  @property({
    type: 'string',
  })
  note?: string;

  @property({
    type: 'string',
  })
  status: BillPaymentStatus;

  @property({
    type: 'string',
  })
  prices: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'paymentMethod',
    },
  })
  paymentMethod: PaymentMethod;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'nameCredit',
    },
  })
  nameCredit: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'numberCredit',
    },
  })
  numberCredit: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'expirationDateCredit',
    },
  })
  expirationDateCredit: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'codeCredit',
    },
  })
  codeCredit: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'addressWallet',
    },
  })
  addressWallet: string;

  @property({
    type: 'string',
  })
  chain: string;

  @property({
    type: 'string',
  })
  coin: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoCreate',
    },
  })
  whoCreate: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'createdAt',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'updatedAt',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<BillPayment>) {
    super(data);
  }
}
