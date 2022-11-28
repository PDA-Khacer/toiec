import {model, property, Entity} from '@loopback/repository';

export enum DiscountPricesStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@model({
  settings: {
    postgresql: {
      table: 'discount-prices',
    },
  },
})
export class DiscountPrices extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  discount: string;

  @property({
    type: 'string',
  })
  status: DiscountPricesStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idWarehouse',
    },
  })
  idWarehouse: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'timeStart',
    },
  })
  timeStart: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'timeEnd',
    },
  })
  timeEnd: Date;

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

  constructor(data?: Partial<DiscountPrices>) {
    super(data);
  }
}
