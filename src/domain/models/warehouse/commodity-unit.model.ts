import {model, property, Entity} from '@loopback/repository';

export enum CommodityUnitStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

export enum CommodityUnitArea {
  SYSTEM = 'system',
  WAREHOUSE = 'warehouse',
}

@model({
  settings: {
    postgresql: {
      table: 'commodity-unit',
    },
  },
})
export class CommodityUnit extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  description: string;

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
      columnName: 'numberSKU',
    },
  })
  numberSKU: string;

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
      columnName: 'idPartner',
    },
  })
  idPartner: string;

  @property({type: 'string'})
  status: CommodityUnitStatus;

  @property({type: 'string'})
  area: CommodityUnitArea;

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

  constructor(data?: Partial<CommodityUnit>) {
    super(data);
  }
}
