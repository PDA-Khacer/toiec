import {model, property, Entity} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'approve-request',
    },
  },
})
export class ApproveRequest extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  note?: string;

  @property({
    type: 'string',
  })
  tag?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'expectedTime',
    },
  })
  expectedTime: Date;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoApprove',
    },
  })
  whoApprove: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idRequest',
    },
  })
  idRequest: string;

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
    type: 'boolean',
    postgresql: {
      columnName: 'isAutoArrange',
    },
  })
  isAutoArrange: boolean;

  // @property({
  //   type: 'string',
  //   postgresql: {
  //     columnName: 'receiptType',
  //   },
  // })
  // receiptType: RequestReceiptType;

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

  constructor(data?: Partial<ApproveRequest>) {
    super(data);
  }
}
