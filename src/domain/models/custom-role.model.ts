import {model, property, Entity} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'custom-role',
    },
  },
})
export class CustomRole extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

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
      columnName: 'customRole',
    },
  })
  customRole: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'isActive',
    },
  })
  isActive: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idAccount',
    },
  })
  idAccount: string;

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

  constructor(data?: Partial<CustomRole>) {
    super(data);
  }
}
