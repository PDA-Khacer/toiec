import {model, property, Entity} from '@loopback/repository';

export enum LocationCategory {
  SYSTEM = 'system',
  SELF = 'self',
}

export enum LocationStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'location',
    },
  },
})
export class Location extends Entity {
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
  coordinates: string;

  @property({
    type: 'string',
  })
  nation: string;

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'string',
  })
  province: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'zipCode',
    },
  })
  zipCode: string;

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
    postgresql: {
      columnName: 'idPartner',
    },
  })
  idPartner: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoCreate',
    },
  })
  whoCreate: string;

  @property({type: 'string'})
  status: LocationStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'locationCategory',
    },
  })
  locationCategory: LocationCategory;

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

  constructor(data?: Partial<Location>) {
    super(data);
  }
}
