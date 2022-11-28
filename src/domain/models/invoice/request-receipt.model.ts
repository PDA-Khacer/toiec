import {model, property, Entity} from '@loopback/repository';

export enum RequestReceiptStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  SUCCESS = 'success',
  DELETING = 'deleting',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCELED = 'canceled',
}

export enum RequestReceiptType {
  EXPORT = 'export',
  IMPORT = 'import',
  INSPECTION = 'inspection',
  SHIP_COD = 'shipCOD',
}

@model({
  settings: {
    postgresql: {
      table: 'request-receipt',
    },
  },
})
export class RequestReceipt extends Entity {
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
  })
  note: string;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
  })
  tag: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoManager',
    },
  })
  whoManager: string;

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

  @property({type: 'string'})
  status: RequestReceiptStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'receiptType',
    },
  })
  receiptType: RequestReceiptType;

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

  constructor(data?: Partial<RequestReceipt>) {
    super(data);
  }
}
