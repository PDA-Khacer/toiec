import {model, property, Entity} from '@loopback/repository';

export enum PartnerType {
  SYSTEM = 'system',
  BOTH = 'both',
  WAREHOUSE = 'warehouse',
  TENANT = 'tenant',
}

export enum PartnerStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'partner',
    },
  },
})
export class Partner extends Entity {
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
    index: {
      unique: true,
    },
  })
  email: string;

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
      columnName: 'idLocation',
    },
  })
  idLocation: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'partnerType',
    },
  })
  partnerType: PartnerType;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'whoCreate',
    },
  })
  whoCreate: string;

  @property({type: 'string'})
  status: PartnerStatus;

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

  constructor(data?: Partial<Partner>) {
    super(data);
  }
}
