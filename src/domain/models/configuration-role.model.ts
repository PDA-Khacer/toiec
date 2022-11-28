import {model, property, Entity} from '@loopback/repository';

export enum TypePartner {
  TENANT = 'tenant',
  WAREHOUSE = 'warehouse',
}

@model({
  settings: {
    postgresql: {
      table: 'configuration-role',
    },
  },
})
export class ConfigurationRole extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'typePartner',
    },
  })
  typePartner: TypePartner;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'jsonData',
    },
  })
  jsonData: string;

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

  constructor(data?: Partial<ConfigurationRole>) {
    super(data);
  }
}
