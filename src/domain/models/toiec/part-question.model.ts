import {model, property, Entity} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'part-question',
    },
  },
})
export class PartQuestion extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

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
    postgresql: {
      columnName: 'typePart',
    },
  })
  typePart: string;

  @property({
    type: 'string',
  })
  note: string;

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

  constructor(data?: Partial<PartQuestion>) {
    super(data);
  }
}
