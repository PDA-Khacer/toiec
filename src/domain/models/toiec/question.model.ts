import {model, property, Entity} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'question',
    },
  },
})
export class Question extends Entity {
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
  content: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'idPartQuestion',
    },
  })
  idPartQuestion: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'correctAnswer',
    },
  })
  correctAnswer: string;

  @property({
    type: 'string',
  })
  answers: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'typeQuestion',
    },
  })
  typeQuestion: string;

  @property({
    type: 'string',
  })
  description: string;

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

  constructor(data?: Partial<Question>) {
    super(data);
  }
}
