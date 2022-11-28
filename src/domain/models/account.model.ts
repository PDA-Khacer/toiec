import {model, property, Entity} from '@loopback/repository';
import {
  assertStateFalse,
  assertStateTrue,
} from '../helpers/assertion-concern.helper';
export namespace AccountConstraint {
  export const PASSWORD_MIN_LENGTH = 6;
  export const PASSWORD_MAX_LENGTH = 24;
}

export enum Role {
  ROOT_ADMIN = 'root_admin',
  ADMIN = 'admin',
  PARTNER_ADMIN = 'partner_admin',
  PARTNER_ROOT_ADMIN = 'partner_root_admin',
  WAREHOUSE_MANGER = 'warehouse_manger',
  TENANT_WAREHOUSE = 'tenant_warehouse',
}

export enum AccountCategory {
  SYSTEM = 'system',
  PARTNER = 'partner',
  PARTNER_WAREHOUSE = 'partner_warehouse',
  PARTNER_TENANT = 'partner_tenant',
  WAREHOUSE = 'warehouse',
  TENANT = 'tenant',
}

export enum AccountStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETING = 'deleting',
}

@model({
  settings: {
    postgresql: {
      table: 'accounts',
    },
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
    hiddenProperties: ['password'],
  },
})
export class Account extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    // index: {
    //   unique: true,
    // },
    jsonSchema: {
      format: 'email',
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 6,
      maxLength: 24,
    },
  })
  password: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'firstName',
    },
  })
  firstName: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'lastName',
    },
  })
  lastName: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'middleName',
    },
  })
  middleName: string;

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
  role: Role;

  @property({type: 'string'})
  status: AccountStatus;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'accountCategory',
    },
  })
  accountCategory: AccountCategory;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'customRole',
    },
  })
  customRole: string;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {
      columnName: 'isCustomRole',
    },
  })
  isCustomRole: boolean;

  @property({
    type: 'boolean',
    postgresql: {
      columnName: 'emailVerified',
    },
  })
  emailVerified: boolean;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {
      columnName: 'isDeleted',
    },
  })
  isDeleted: boolean;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'expDate',
    },
  })
  expDate: Date;

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
      columnName: 'deletedAt',
    },
  })
  deletedAt: Date;

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

  @property({
    type: 'string',
    postgresql: {
      columnName: 'warehouseSelection',
    },
  })
  warehouseSelection: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }

  public canVerifyEmail(): boolean {
    return (
      this.isActive() && this.role !== Role.ROOT_ADMIN && !this.emailVerified
    );
  }

  public verify(): void {
    assertStateTrue(this.isActive(), 'inactive_account');
    assertStateFalse(this.emailVerified, 'already_verified');

    this.emailVerified = true;
  }

  public isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  public setNewPassword(newPassword: string) {
    assertStateTrue(this.isActive(), 'inactive_account');

    this.password = newPassword;
  }
}

export interface FormAssignAccount {
  username: string;
  password: string;
  email: string;
  fullName: string;
  type: string;
  x: string;
  y: string;
  z: string;
  capacity: string;
}
