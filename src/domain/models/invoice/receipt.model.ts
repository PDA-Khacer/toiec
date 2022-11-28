import {model, property, Entity} from '@loopback/repository';

export enum ReceiptStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  SUCCESS = 'success',
  DELETING = 'deleting',
}

export enum ReceiptType {
  EXPORT = 'export',
  IMPORT = 'import',
}

@model({
  settings: {
    postgresql: {
      table: 'receipt',
    },
  },
})
export class Receipt extends Entity {
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
      columnName: 'idPartner',
    },
  })
  idPartner: string;

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
  status: ReceiptStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'receiptType',
    },
  })
  receiptType: ReceiptType;

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

  constructor(data?: Partial<Receipt>) {
    super(data);
  }
}
