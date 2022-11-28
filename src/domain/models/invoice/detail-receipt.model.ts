import {model, property, Entity} from '@loopback/repository';

export enum DetailReceiptStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  SUCCESS = 'success',
  TAKING = 'taking',
  STORING = 'storing',
  DELETING = 'deleting',
}

export enum DetailReceiptType {
  EXPORT = 'export',
  IMPORT = 'import',
}

@model({
  settings: {
    postgresql: {
      table: 'detail-receipt',
    },
  },
})
export class DetailReceipt extends Entity {
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
      columnName: 'whoWork',
    },
  })
  whoWork: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idProductZone',
    },
  })
  idProductZone: string;

  @property({
    type: 'string',
  })
  quantity: string;

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
    type: 'number',
    postgresql: {
      columnName: 'timeBreak',
    },
  })
  timeBreak: number;

  @property({type: 'string'})
  status: DetailReceiptStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'receiptType',
    },
  })
  receiptType: DetailReceiptType;

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

  constructor(data?: Partial<DetailReceipt>) {
    super(data);
  }
}
