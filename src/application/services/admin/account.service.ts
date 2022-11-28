import {bind, config} from '@loopback/context';
import {Count, Filter, repository, Where} from '@loopback/repository';
import {service} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {ConfigBindings} from '../../../keys';
import {AccountFactory} from '../../../domain/services/account-factory.service';
import {
  AccountRepository,
  PartnerRepository,
  WarehouseManagerRepository,
  WarehouseRepository,
} from '../../../infrastructure/repositories';
import {
  Account,
  AccountCategory,
  FormAssignAccount,
  Role,
} from '../../../domain/models/account.model';
import {PartnerStatus, PartnerType} from '../../../domain/models/partner.model';
import {Condition} from '@loopback/filter/src/query';
import {WarehouseManagerService} from './warehouse/warehouse-manager.service';
import {
  Warehouse,
  WarehouseType,
} from '../../../domain/models/warehouse/warehouse.model';
import {WarehouseManager} from '../../../domain/models/warehouse/warehouse-manager.model';

@bind()
export class AccountAdminService {
  constructor(
    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @service(AccountFactory)
    private accountFactory: AccountFactory,

    @service(WarehouseManagerService)
    private warehouseManagerService: WarehouseManagerService,

    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  // ======================   private function
  private async isSelf(idRoot: number, role: Role): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {id: idRoot, isDeleted: false},
    });
    if (!account) {
      throw new HttpErrors.NotFound('msgNotFoundAccount');
    }

    if (account.expDate <= new Date()) {
      throw new HttpErrors.BadRequest('msgAccountExpDate');
    }

    if (account.isCustomRole) {
      // check role
    }

    // if (account.role !== role) {
    //   throw new HttpErrors.Unauthorized('msgNotRole');
    // }
    // TODO: Check group role here
    return account;
  }

  // ====================== public function

  public async getAccountPartner(
    idRoot: number,
    filter?: Filter<Account>,
  ): Promise<Array<Account>> {
    await this.isSelf(idRoot, Role.ROOT_ADMIN);
    const whereOption = filter?.where ? filter.where : {};
    const filterOption: Filter<Account> = {
      ...filter,
      where: {and: [{isDeleted: {eq: false}}, whereOption]},
    };
    return this.accountRepository.find(filterOption);
  }

  public async countAccountPartner(
    idRoot: number,
    where?: Where<Account>,
  ): Promise<Count> {
    await this.isSelf(idRoot, Role.ROOT_ADMIN);
    const whereOption: Where<Account> = {
      and: [{...where}, {isDeleted: {eq: false}}],
    };
    return this.accountRepository.count(whereOption);
  }

  public async createAccountPartner(
    idRoot: number,
    values: Omit<Account, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.isSelf(idRoot, Role.ROOT_ADMIN);

    if (
      values.idPartner === undefined ||
      values.idPartner === null ||
      Number(values.idPartner) === 0
    ) {
      throw new HttpErrors.Conflict('msgWrongPartner');
    }

    if (self.role === Role.ROOT_ADMIN || self.role === Role.ADMIN) {
      await this.partnerRepository
        .findById(Number(values.idPartner))
        .catch(reason => {
          console.log(reason.toString());
          throw new HttpErrors.NotFound('msgNotFoundPartner');
        });
    } else {
      values.idPartner = self.idPartner;
    }

    let account;
    switch (values.role) {
      case Role.WAREHOUSE_MANGER:
        account = await this.accountFactory.buildPartnerWarehouseManagerAccount(
          values,
        );
        break;
      case Role.TENANT_WAREHOUSE:
        account = await this.accountFactory.buildPartnerTenantManagerAccount(
          values,
        );
        break;
      default:
        switch (values.accountCategory) {
          case AccountCategory.TENANT:
            account = await this.accountFactory.buildPartnerAdminAccount(
              values,
            );
        }
        break;
    }
    if (account) {
      account.whoCreate = self.id.toString();
      // account.idPartner = self.idPartner;
      if (!account.expDate) {
        account.expDate = self.expDate;
      } else {
        account.expDate =
          account.expDate > self.expDate ? self.expDate : account.expDate;
      }

      // const acc = await this.accountRepository.create(account);
      if (values.role === Role.TENANT_WAREHOUSE) {
        await this.initAccountTenant2(
          values.email,
          values.username,
          values.password,
          self.idPartner,
          self.id.toString(),
          self.expDate,
        );
      } else {
        await this.accountRepository.create(account);
      }
    }
    return true;
  }

  public async initAccountPartner(
    cate: PartnerType,
    email: string,
    idPartner: string,
    idSelf: string,
    expDate: Date,
  ): Promise<boolean> {
    let rootPartner: Account;
    const account = {
      email: email,
      password: '123456',
      role: Role.PARTNER_ROOT_ADMIN,
      username: 'RootAdmin_' + email,
    };
    switch (cate) {
      case PartnerType.SYSTEM:
        rootPartner = await this.accountFactory.buildPartnerRootBothAccount(
          account,
        );
        break;
      case PartnerType.TENANT:
        rootPartner = await this.accountFactory.buildPartnerRootTenantAccount(
          account,
        );
        rootPartner.accountCategory = AccountCategory.PARTNER_TENANT;
        break;
      case PartnerType.WAREHOUSE:
        rootPartner =
          await this.accountFactory.buildPartnerRootWarehouseAccount(account);
        rootPartner.accountCategory = AccountCategory.PARTNER_WAREHOUSE;
        break;
      case PartnerType.BOTH:
        rootPartner = await this.accountFactory.buildPartnerRootBothAccount(
          account,
        );
        rootPartner.accountCategory = AccountCategory.PARTNER;
        break;
    }
    rootPartner.whoCreate = idSelf;
    rootPartner.idPartner = idPartner;
    rootPartner.expDate = expDate;

    await this.accountRepository.create(rootPartner);
    return true;
  }

  public async initAccountWarehouse(
    email: string,
    idPartner: string,
    idSelf: string,
    expDate: Date,
  ): Promise<Account> {
    const rootPartner =
      await this.accountFactory.buildPartnerWarehouseManagerAccount({
        email: email,
        password: '123456',
        role: Role.WAREHOUSE_MANGER,
        username: 'WarehouseManager_' + email,
      });
    rootPartner.whoCreate = idSelf;
    rootPartner.idPartner = idPartner;
    rootPartner.expDate = expDate;

    return this.accountRepository.create(rootPartner);
  }

  public async initAccountTenant(
    email: string,
    idPartner: string,
    idSelf: string,
    expDate: Date,
  ): Promise<Account> {
    const rootPartner =
      await this.accountFactory.buildPartnerTenantManagerAccount({
        email: new Date().getTime().toString() + email,
        password: '123456',
        role: Role.TENANT_WAREHOUSE,
        username: 'TenantWarehouse_' + email,
      });
    rootPartner.whoCreate = idSelf;
    rootPartner.idPartner = idPartner;
    rootPartner.expDate = expDate;

    return this.accountRepository.create(rootPartner);
  }

  public async initAccountTenant2(
    email: string,
    username: string,
    password: string,
    idPartner: string,
    idSelf: string,
    expDate: Date,
  ): Promise<Account> {
    const rootPartner =
      await this.accountFactory.buildPartnerTenantManagerAccount({
        email: email,
        password: password,
        role: Role.TENANT_WAREHOUSE,
        username: username,
      });
    rootPartner.whoCreate = idSelf;
    rootPartner.idPartner = idPartner;
    rootPartner.expDate = expDate;

    const tenantManager = await this.accountRepository.create(rootPartner);

    await this.warehouseManagerService.initTenant(
      Number(idSelf),
      tenantManager.id.toString(),
      idPartner,
      idPartner,
    );
    return tenantManager;
  }

  // manager tenant
  public async getManagerTenant(
    idSelf: number,
    idTenant: string,
    filter?: Filter<Account>,
  ): Promise<Array<Account>> {
    let orderString = '';
    let whereString = '';
    if (filter) {
      for (const [key, value] of Object.entries(
        filter.where as Condition<Account>,
      )) {
        whereString += `and acc.${key} = '${value}'`;
      }
      orderString = filter.order ? 'order by ' + filter.order[0] : '';
    }

    const command = `select acc.* from accounts acc
    inner join (select * from "warehouse-manager" b where b."idTenant" = '${idTenant}') wm
    on acc.id::"text" = wm."idAccount"
    where acc."role" = 'tenant_warehouse' ${whereString} and acc."isDeleted" != 'true' 
    ${orderString}
    limit ${filter ? filter.limit : 0} offset ${filter ? filter.offset : 0}`;

    const managers = await this.accountRepository.execute(command);
    return managers as Array<Account>;
  }

  public async countManagerTenant(
    idSelf: number,
    idTenant: string,
    where?: Where<Account>,
  ): Promise<{count: string}> {
    let whereString = '';

    for (const [key, value] of Object.entries(where as Condition<Account>)) {
      whereString += `and acc.${key} = '${value}'`;
    }

    const command = `select Count(acc.*) from accounts acc
    inner join (select * from "warehouse-manager" b where b."idTenant" = '${idTenant}') wm
    on acc.id::"text" = wm."idAccount"
    where acc."role" = 'tenant_warehouse' ${whereString} and acc."isDeleted" != 'true'`;

    const count = await this.accountRepository.execute(command);
    return count[0] as {count: string};
  }

  public async assignAccount(form: FormAssignAccount): Promise<Account> {
    let account: Account;
    if (form.type === 'warehouse') {
      account = await this.accountFactory.buildPartnerWarehouseManagerAccount({
        email: form.email,
        password: form.password,
        role: Role.WAREHOUSE_MANGER,
        username: form.username,
      });
      // const partner = await this.partnerRepository.findOne({
      //   where: {code: 'partner_root_warehouse'},
      // });

      const partner = await this.partnerRepository.create({
        code: 'partner_root_warehouse_' + form.username,
        name: 'root_warehouse',
        email: `root_warehouse_${form.username}@email.com`,
        tag: '',
        note: '',
        partnerType: PartnerType.WAREHOUSE,
        whoCreate: '1',
        status: PartnerStatus.ACTIVE,
      });
      account.idPartner = partner ? partner.id.toString() : '';
    } else {
      account = await this.accountFactory.buildPartnerTenantManagerAccount({
        email: form.email,
        password: form.password,
        role: Role.TENANT_WAREHOUSE,
        username: form.username,
      });
      // const partner = await this.partnerRepository.findOne({
      //   where: {code: 'partner_root_tenant'},
      // });
      const partner = await this.partnerRepository.create({
        code: 'partner_root_tenant' + form.username,
        name: 'root_tenant',
        email: `root_tenant_${form.username}@email.com`,
        tag: '',
        note: '',
        partnerType: PartnerType.TENANT,
        whoCreate: '1',
        status: PartnerStatus.ACTIVE,
      });

      account.idPartner = partner ? partner.id.toString() : '';
    }
    account.whoCreate = '1';
    account.expDate = new Date(new Date().setUTCFullYear(2050, 1, 1));

    const acc = await this.accountRepository.create(account);

    if (form.type === 'warehouse') {
      const partner = await this.partnerRepository.findOne({
        where: {code: 'partner_root_warehouse_' + form.username},
      });
      const code = `wh_${Date.now()}`;
      const warehouse = await this.warehouseRepository.create(
        new Warehouse({
          code: code ? code : `${form.username}_wh`,
          x: form.x,
          y: form.y,
          z: form.z,
          capacity: form.capacity,
          tag: '',
          note: '',
          remainingCapacity: form.capacity,
          idPartner: partner ? partner.id.toString() : '',
          whoCreate: '1',
          warehouseType: WarehouseType.DEFAULT,
        }),
      );
      //
      await this.warehouseManagerRepository.create(
        new WarehouseManager({
          idWarehouse: warehouse.id.toString(),
          idAccount: acc.id.toString(),
          idPartner: partner ? partner.id.toString() : '',
          idTenant: partner ? partner.id.toString() : '',
        }),
      );
    }

    return acc;
  }

  public async selectionWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<boolean> {
    await this.accountRepository.updateById(idSelf, {
      warehouseSelection: idWarehouse,
    });
    return true;
  }
}
