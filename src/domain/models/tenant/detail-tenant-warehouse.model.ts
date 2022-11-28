import {model, property, Entity} from '@loopback/repository';

export enum DetailTenantWarehouseStatus {
  REJECT = 'reject',
  WAITING = 'waiting',
  SUCCESS = 'success',
  EXPIRED = 'expired',
}

export enum TypeGetTenantWarehouse {
  ALL = 'all',
  EXPIRED = 'expired',
  REMAIN = 'remain',
}

@model({
  settings: {
    postgresql: {
      table: 'detail-tenant-warehouse',
    },
  },
})
export class DetailTenantWarehouseModel extends Entity {
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
      columnName: 'numberSKU',
    },
  })
  numberSKU: string;

  @property({
    type: 'string',
  })
  note: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idBill',
    },
  })
  idBill: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idTenant',
    },
  })
  idTenant: string;

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
      columnName: 'startDate',
    },
  })
  startDate: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'expDate',
    },
  })
  expDate: Date;

  @property({type: 'string'})
  status: DetailTenantWarehouseStatus;

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

  constructor(data?: Partial<DetailTenantWarehouseModel>) {
    super(data);
  }
}

export interface WarehouseTenanted {
  id?: number;
  code?: string;
  numberSKU?: string;
  idBill?: string;
  startDate?: Date;
  expDate?: Date;
  status?: DetailTenantWarehouseStatus;
  idWarehouse?: string;
  numberProduct?: string;
}
