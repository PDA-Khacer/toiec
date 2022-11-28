import {model, property, Entity} from '@loopback/repository';

export enum ProductZoneStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'product-zone',
    },
  },
})
export class ProductZone extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  quantity: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'lotNumber',
    },
  })
  lotNumber: string;

  @property({
    type: 'string',
  })
  note: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'expDate',
    },
  })
  expDate: string;

  @property({
    type: 'string',
  })
  sku: string;

  @property({
    type: 'string',
  })
  priority: number;

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
      columnName: 'idZone',
    },
  })
  idZone: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idProduct',
    },
  })
  idProduct: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'dayMustOut',
    },
  })
  dayMustOut: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'dayIn',
    },
  })
  dayIn: Date;

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
      columnName: 'idTenant',
    },
  })
  idTenant: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idPartner',
    },
  })
  idPartner: string;

  @property({type: 'string'})
  status: ProductZoneStatus;

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

  constructor(data?: Partial<ProductZone>) {
    super(data);
  }
}
