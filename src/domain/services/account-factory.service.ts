import {repository} from '@loopback/repository';
import {bind, inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {
  Account,
  AccountCategory,
  AccountStatus,
  Role,
} from '../models/account.model';
import {AccountRepository} from '../repositories/account.repository';
import {PasswordHasher} from './password-hasher.service';

@bind()
export class AccountFactory {
  constructor(
    @repository('AccountRepository')
    private accountRepository: AccountRepository,

    @inject('services.BcryptPasswordHasher')
    private passwordHasher: PasswordHasher,
  ) {}

  public async buildSubRootAdminAccount(
    values: Pick<Account, 'email' | 'username' | 'password'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.ADMIN,
        accountCategory: AccountCategory.SYSTEM,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
      }),
    );
  }

  public async buildRootAdminAccount(
    values: Pick<Account, 'email' | 'username' | 'password'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.ROOT_ADMIN,
        accountCategory: AccountCategory.SYSTEM,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
      }),
    );
  }

  public async buildSystemAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    if (values.role !== Role.ADMIN) {
      throw new HttpErrors.BadRequest('msgWrongRole');
    }
    return this.buildAccount(
      new Account({
        ...values,
        accountCategory: AccountCategory.SYSTEM,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
      }),
    );
  }

  // public async buildPartnerAccount(
  //   values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  // ): Promise<Account> {
  //   if (
  //     values.role !== Role.PARTNER_ADMIN &&
  //     values.role !== Role.PARTNER_ROOT_ADMIN &&
  //     values.role !== Role.WAREHOUSE_MANGER &&
  //     values.role !== Role.TENANT_WAREHOUSE
  //   ) {
  //     throw new HttpErrors.BadRequest('msgWrongRole');
  //   }
  //   return this.buildAccount(
  //     new Account({
  //       ...values,
  //       accountCategory: AccountCategory.PARTNER,
  //       status: AccountStatus.ACTIVE,
  //       emailVerified: false,
  //     }),
  //   );
  // }

  public async buildPartnerWarehouseManagerAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.WAREHOUSE_MANGER,
        accountCategory: AccountCategory.WAREHOUSE,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildPartnerTenantManagerAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.TENANT_WAREHOUSE,
        accountCategory: AccountCategory.TENANT,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildPartnerAdminAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.PARTNER_ADMIN,
        accountCategory: AccountCategory.PARTNER,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildPartnerRootBothAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.PARTNER_ROOT_ADMIN,
        accountCategory: AccountCategory.PARTNER,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildPartnerRootWarehouseAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.PARTNER_ROOT_ADMIN,
        accountCategory: AccountCategory.PARTNER_WAREHOUSE,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildPartnerRootTenantAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    return this.buildAccount(
      new Account({
        ...values,
        role: Role.TENANT_WAREHOUSE,
        accountCategory: AccountCategory.PARTNER_TENANT,
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      }),
    );
  }

  public async buildAccount(
    values: Pick<Account, 'email' | 'username' | 'password' | 'role'>,
  ): Promise<Account> {
    const emailExisted = await this.accountRepository.emailRegistered(
      values.email,
    );

    if (emailExisted) {
      throw new HttpErrors.BadRequest('email_registered');
    }

    const usernameExisted = await this.accountRepository.usernameRegistered(
      values.username,
    );

    if (usernameExisted) {
      throw new HttpErrors.BadRequest('username_registered');
    }

    const hashedPassword = await this.passwordHasher.hashPassword(
      values.password,
    );
    return new Account({
      ...values,
      password: hashedPassword,
      status: AccountStatus.ACTIVE,
    });
  }
}
