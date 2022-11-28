import {model, property, Entity} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'detail-loading-product',
    },
  },
})
export class DetailLoadingProduct extends Entity {
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
    postgresql: {
      columnName: 'idZone',
    },
  })
  idZone: string;

  @property({
    type: 'string',
  })
  quantity: string;

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
      columnName: 'whoLoading',
    },
  })
  whoLoading: string;

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
    type: 'string',
    postgresql: {
      columnName: 'whoCreate',
    },
  })
  whoCreate: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'startAt',
    },
  })
  startAt: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'doneAt',
    },
  })
  doneAt: Date;

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

  constructor(data?: Partial<DetailLoadingProduct>) {
    super(data);
  }
}
