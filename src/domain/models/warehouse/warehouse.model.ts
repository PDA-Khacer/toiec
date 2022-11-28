import {model, property, Entity} from '@loopback/repository';

export enum WarehouseType {
  DEFAULT = 'default',
  DISTRIBUTION_CENTER = 'distribution center',
  SMART_WAREHOUSE = 'smart warehouse',
  COLD_STORAGE = 'cold storage',
  BONDED_WAREHOUSE = 'bonded warehouse',
}

export enum WarehouseStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'warehouse',
    },
  },
})
export class Warehouse extends Entity {
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
  x: string;

  @property({
    type: 'string',
  })
  y: string;

  @property({
    type: 'string',
  })
  z: string;

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
      columnName: 'remainingCapacity',
    },
  })
  remainingCapacity: string;

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
      columnName: 'idLocation',
    },
  })
  idLocation: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'warehouseType',
    },
  })
  warehouseType: WarehouseType;

  @property({type: 'string'})
  status: WarehouseStatus;

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

  constructor(data?: Partial<Warehouse>) {
    super(data);
  }
}
