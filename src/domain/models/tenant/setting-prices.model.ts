import {model, property, Entity} from '@loopback/repository';

export enum PaymentMethod {
  CRYPTO = 'crypto',
  CREDIT_CARD = 'creditCard',
  BOTH = 'both',
}

@model({
  settings: {
    postgresql: {
      table: 'setting-prices',
    },
  },
})
export class SettingPrices extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  note: string;

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
    type: 'boolean',
    postgresql: {
      columnName: 'autoAccept',
    },
  })
  autoAccept: boolean;

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
      columnName: 'idWarehouse',
    },
  })
  idWarehouse: string;

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

  @property({
    type: 'date',
    postgresql: {
      columnName: 'lockedAt',
    },
  })
  lockedAt: Date;

  @property({
    type: 'boolean',
    postgresql: {
      columnName: 'isLocked',
    },
  })
  isLocked: boolean;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoLocked',
    },
  })
  whoLocked: string;

  constructor(data?: Partial<SettingPrices>) {
    super(data);
  }
}
