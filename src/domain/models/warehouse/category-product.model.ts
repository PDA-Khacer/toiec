import {model, property, Entity} from '@loopback/repository';

export enum CategoryProductStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

export enum CategoryProductArea {
  SYSTEM = 'system',
  WAREHOUSE = 'warehouse',
}

@model({
  settings: {
    postgresql: {
      table: 'category-product',
    },
  },
})
export class CategoryProduct extends Entity {
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
    postgresql: {
      columnName: 'shortName',
    },
  })
  shortName: string;

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
      columnName: 'idCateFather',
    },
  })
  idCateFather: string;

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
      columnName: 'categoryProductArea',
    },
  })
  categoryProductArea: CategoryProductArea;

  @property({type: 'string'})
  status: CategoryProductStatus;

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

  constructor(data?: Partial<CategoryProduct>) {
    super(data);
  }
}

export class TreeNode {
  id: number;
  title: string;
  lvl: number;
  subNode: Array<TreeNode>;
}
