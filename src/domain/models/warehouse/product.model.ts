import {model, property, Entity} from '@loopback/repository';

export enum ProductStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'product',
    },
  },
})
export class Product extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    index: {
      unique: true,
    },
  })
  code: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'shortName',
    },
  })
  shortName: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'fullName',
    },
  })
  fullName: string;

  @property({
    type: 'string',
  })
  note: string;

  @property({
    type: 'string',
  })
  tag: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'imageProduct',
    },
  })
  imageProduct: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'totalQuantity',
    },
  })
  totalQuantity: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'inComingQuantity',
    },
  })
  inComingQuantity: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'outComingQuantity',
    },
  })
  outComingQuantity: string;

  @property({
    type: 'string',
    index: {
      unique: true,
    },
  })
  barcode: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idCommodityUnit',
    },
  })
  idCommodityUnit: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idCategory',
    },
  })
  idCategory: string;

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
      columnName: 'idPartner',
    },
  })
  idPartner: string;

  @property({type: 'string'})
  status: ProductStatus;

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

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductSelection {
  id?: string;
  code?: string;
  shortName?: string;
  fullName?: string;
  note?: string;
  quantity?: string;
  totalQuantity?: string;
  inComingQuantity?: string;
  outComingQuantity?: string;
  barcode?: string;
  idCommodityUnit?: string;
  idCategory?: string;
  imageProduct?: string;
}
