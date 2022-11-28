import {model, property, Entity} from '@loopback/repository';

export enum InspectionStatus {
  BROKE = 'broke',
  NORMAL = 'normal',
  EXPIRED = 'expired',
}

@model({
  settings: {
    postgresql: {
      table: 'detail-request-receipt',
    },
  },
})
export class DetailRequestReceipt extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idReceipt',
    },
  })
  idReceipt: string; // idRequest

  @property({
    type: 'string',
  })
  note: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoInspection',
    },
  })
  whoInspection: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idProduct',
    },
  })
  idProduct: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'inspectionStatus',
    },
  })
  inspectionStatus: InspectionStatus;

  @property({
    type: 'string',
  })
  quantity: string;

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
    postgresql: {
      columnName: 'imageProduct',
    },
  })
  imageProduct: string;

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

  constructor(data?: Partial<DetailRequestReceipt>) {
    super(data);
  }
}
