import {model, property, Entity} from '@loopback/repository';

export enum ShipCODStatus {
  DRAFT = 'draft',
  LOADING = 'loading',
  STARTED = 'started',
  RECEIVED = 'received',
  REFUSE = 'refuse',
}

@model({
  settings: {
    postgresql: {
      table: 'ship-cod',
    },
  },
})
export class ShipCOD extends Entity {
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
    postgresql: {
      columnName: 'idRequest',
    },
  })
  idRequest: string;

  @property({
    type: 'string',
  })
  cash: string;

  @property({
    type: 'string',
  })
  status: ShipCODStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoShip',
    },
  })
  whoShip: string;

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

  constructor(data?: Partial<ShipCOD>) {
    super(data);
  }
}
