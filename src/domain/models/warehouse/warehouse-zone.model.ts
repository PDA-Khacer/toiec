import {model, property, Entity} from '@loopback/repository';

export enum WarehouseZoneType {
  DEFAULT = 'default',
  HEAD = 'head',
  MIDDLE = 'middle',
  TAIL = 'tail',
  SHIPPING = 'shipping',
  PACKING = 'packing',
  SHIPPING_PACKING = 'shipping packing',
  WAITING_GOODS = 'waiting goods',
}

export enum WarehouseZoneStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'warehouse-zone',
    },
  },
})
export class WarehouseZone extends Entity {
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
  coordinates: string;

  @property({
    type: 'string',
  })
  x: string;

  @property({
    type: 'string',
  })
  y: string;

  @property({
    type: 'string',
  })
  capacity: string;

  @property({
    type: 'string',
  })
  tag: string;

  @property({
    type: 'string',
  })
  note: string;

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
      columnName: 'warehouseType',
    },
  })
  warehouseType: WarehouseZoneType;

  @property({type: 'string'})
  status: WarehouseZoneStatus;

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

  constructor(data?: Partial<WarehouseZone>) {
    super(data);
  }
}
