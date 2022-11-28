import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  LocationRepository,
  PartnerRepository,
  WarehouseRepository,
  WarehouseManagerRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account, Role} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {WarehouseFactory} from '../../../../domain/services/warehouse/warehouse-factory.service';
import {
  Warehouse,
  WarehouseStatus,
  WarehouseType,
} from '../../../../domain/models/warehouse/warehouse.model';
import {AccountAdminService} from '../account.service';
import {WarehouseManagerService} from './warehouse-manager.service';
import {Condition} from '@loopback/filter/src/query';
import {TypeGetTenantWarehouse} from '../../../../domain/models/tenant/detail-tenant-warehouse.model';

@bind()
export class WarehouseService {
  constructor(
    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(LocationRepository)
    private locationRepository: LocationRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @service(WarehouseFactory)
    private warehouseFactory: WarehouseFactory,

    @service(AccountAdminService)
    private accountAdminService: AccountAdminService,

    @service(WarehouseManagerService)
    private warehouseManagerService: WarehouseManagerService,
  ) {}

  public async createWarehouse(
    idSelf: number,
    values: Omit<Warehouse, 'id'>,
  ): Promise<boolean> {
    try {
      // check
      const self = await this.getSelf(idSelf);

      // create
      let warehouse: Warehouse;

      switch (values.warehouseType) {
        case WarehouseType.DEFAULT:
          warehouse = await this.warehouseFactory.buildWarehouseDefault(values);
          break;
        case WarehouseType.DISTRIBUTION_CENTER:
          warehouse =
            await this.warehouseFactory.buildWarehouseDistributionCenter(
              values,
            );
          break;
        case WarehouseType.BONDED_WAREHOUSE:
          warehouse =
            await this.warehouseFactory.buildWarehouseBoundedWarehouse(values);
          break;
        case WarehouseType.COLD_STORAGE:
          warehouse = await this.warehouseFactory.buildWarehouseColdStorage(
            values,
          );
          break;
        case WarehouseType.SMART_WAREHOUSE:
          warehouse = await this.warehouseFactory.buildWarehouseSmartWarehouse(
            values,
          );
          break;
      }

      await this.checkRequire(warehouse);

      warehouse.whoCreate = self.id.toString();
      const warehouseCreated = await this.warehouseRepository.create(warehouse);

      // create account warehouse_manger

      const partner = await this.partnerRepository.findById(
        Number(warehouse.idPartner),
      );

      const warehouseManager =
        await this.accountAdminService.initAccountWarehouse(
          warehouseCreated.id.toString() + '_' + partner.email,
          partner.id.toString(),
          idSelf.toString(),
          self.expDate,
        );

      await this.warehouseManagerService.initWarehouse(
        idSelf,
        warehouseManager.id.toString(),
        partner.id.toString(),
        warehouseCreated.id.toString(),
      );

      return true;
    } catch (e) {
      console.log(
        '[ERR] src/infrastructure/services/warehouse.service.ts:84',
        e.toString(),
      );
      return false;
    }
  }

  public async getById(
    idSelf: number,
    idWarehouse: number,
  ): Promise<Warehouse> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockWarehouse(idSelf, idWarehouse))) {
      return this.warehouseRepository.findById(idWarehouse).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async getBySelf(idSelf: number): Promise<Warehouse> {
    // check
    const self = await this.getSelf(idSelf);

    if (self.role !== Role.WAREHOUSE_MANGER) {
      throw new HttpErrors.BadRequest('msgNotWarehouseManager');
    }
    // get idWarehouse

    const warehouse = await this.warehouseManagerRepository.findOne({
      where: {idAccount: self.id.toString(), idPartner: self.idPartner},
    });

    if (warehouse) {
      if (
        !(await this.checkLockWarehouse(idSelf, Number(warehouse.idWarehouse)))
      ) {
        return this.warehouseRepository
          .findById(Number(warehouse.idWarehouse))
          .catch(reason => {
            console.log(reason);
            throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
          });
      }
      throw new HttpErrors.BadRequest('msgDataBeLock');
    }
    throw new HttpErrors.BadRequest('msgNotFoundWarehouse');
  }

  public async getSelection(idSelf: number): Promise<Warehouse> {
    const self = await this.getSelf(idSelf);
    return this.warehouseRepository
      .findById(Number(self.warehouseSelection))
      .catch(() => {
        throw new HttpErrors.NotFound('mgsNotFoundsWarehouse');
      });
  }

  public async get(
    idSelf: number,
    filter?: Filter<Warehouse>,
  ): Promise<Array<Warehouse>> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseRepository.find(filter);
  }

  public async count(idSelf: number, where?: Where<Warehouse>): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseRepository.count(where);
  }

  public async updateWarehouse(
    idSelf: number,
    idWarehouse: number,
    value: Warehouse,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockWarehouse(idSelf, idWarehouse, true)) {
      await this.warehouseRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockWarehouse(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusWarehouse(
    idSelf: number,
    idWarehouse: number,
    status: WarehouseStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockWarehouse(idSelf, idWarehouse, true)) {
      const value = await this.warehouseRepository
        .findById(idWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
        });
      value.status = status;
      await this.warehouseRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockWarehouse(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockWarehouse(
    idSelf: number,
    idWarehouse: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.warehouseRepository
      .findById(idWarehouse)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });
    return warehouse.isLocked;
  }

  private async lockWarehouse(
    idSelf: number,
    idWarehouse: number,
    beLock: boolean,
  ): Promise<boolean> {
    const warehouse = await this.warehouseRepository
      .findById(idWarehouse)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });

    if (warehouse.isLocked) {
      throw new HttpErrors.BadRequest('mgsWarehouseLocked');
    } else {
      if (beLock) {
        warehouse.isLocked = true;
        warehouse.whoLocked = String(idSelf);
        warehouse.lockedAt = new Date();
      } else {
        warehouse.isLocked = false;
      }
      await this.warehouseRepository.updateById(idWarehouse, warehouse);
      return true;
    }
  }

  private async checkRequire(value: Warehouse): Promise<boolean> {
    await this.partnerRepository
      .findById(Number(value.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundPartner');
      });

    if (value.idLocation !== '0' && value.idLocation != null) {
      await this.locationRepository
        .findById(Number(value.idLocation))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundLocation');
        });
    }
    return true;
  }

  private async getSelf(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {id: id, isDeleted: false},
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

    return account;
  }

  // manager warehouse
  public async getManagerWarehouse(
    idSelf: number,
    idWarehouse: string,
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
    inner join (select * from "warehouse-manager" b where b."idWarehouse" = '${idWarehouse}') wm
    on acc.id::"text" = wm."idAccount"
    where acc."role" = 'warehouse_manger' ${whereString}
    ${orderString}
    limit ${filter ? filter.limit : 0} offset ${filter ? filter.offset : 0}`;

    const managers = await this.accountRepository.execute(command);
    return managers as Array<Account>;
  }

  public async countManagerWarehouse(
    idSelf: number,
    idWarehouse: string,
    where?: Where<Account>,
  ): Promise<{count: string}> {
    let whereString = '';

    for (const [key, value] of Object.entries(where as Condition<Account>)) {
      whereString += `and acc.${key} = '${value}'`;
    }

    const command = `select Count(acc.*) from accounts acc
    inner join (select * from "warehouse-manager" b where b."idWarehouse" = '${idWarehouse}') wm
    on acc.id::"text" = wm."idAccount"
    where acc."role" = 'warehouse_manger' ${whereString}`;

    const count = await this.accountRepository.execute(command);
    return count[0] as {count: string};
  }

  public async getWarehouseNotTenanted(
    idSelf: number,
    filter?: Filter<Warehouse>,
  ): Promise<Array<Warehouse>> {
    // check
    const self = await this.getSelf(idSelf);

    await this.partnerRepository
      .findById(Number(self.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundPartner');
      });

    let orderString = '';
    let whereString = '';
    if (filter) {
      for (const [key, value] of Object.entries(
        filter.where as Condition<Warehouse>,
      )) {
        whereString += `and warehouse.${key} = '${value}' `;
      }
      orderString = filter.order ? ' order by ' + filter.order[0] : '';
    }

    const command = `select * from warehouse where warehouse.id not in
      (select warehouse.id from 
      (select * from "detail-tenant-warehouse" e where e."idTenant" = '${self.id.toString()}') f 
      inner join 
      warehouse on f."idWarehouse"= warehouse.id::text)  
      ${whereString}
      ${orderString}
      limit ${filter ? filter.limit : 0} offset ${filter ? filter.offset : 0}`;

    const warehouse = await this.warehouseRepository.execute(command);
    return warehouse as Array<Warehouse>;
  }

  public async countWarehouseNotTenanted(
    idSelf: number,
    where?: Where<Warehouse>,
  ): Promise<{count: string}> {
    // check
    const self = await this.getSelf(idSelf);

    let whereString = '';

    for (const [key, value] of Object.entries(where as Condition<Warehouse>)) {
      whereString += `and warehouse.${key} = '${value}' `;
    }

    const command = `select Count(*) from warehouse where warehouse.id not in
      (select warehouse.id from 
      (select * from "detail-tenant-warehouse" e where e."idTenant" = '${self.id.toString()}') f 
      inner join 
      warehouse on f."idWarehouse"= warehouse.id::text) 
      ${whereString} `;

    const count = await this.warehouseRepository.execute(command);
    return count[0] as {count: string};
  }

  public async getAllWarehouseTenanted(
    idSelf: number,
    typeGet: TypeGetTenantWarehouse,
  ): Promise<Array<Warehouse>> {
    // check
    const self = await this.getSelf(idSelf);
    let whereStatus = '';

    switch (typeGet) {
      case TypeGetTenantWarehouse.ALL:
        whereStatus = `and e."status" <> 'reject'`;
        break;
      case TypeGetTenantWarehouse.EXPIRED:
        whereStatus = `and e."status" = 'expired'`;
        break;
      case TypeGetTenantWarehouse.REMAIN:
        whereStatus = `and e."status" = 'success'`;
        break;
    }

    const command = `select warehouse.* from 
    (select * from "detail-tenant-warehouse" e 
      where e."idTenant" = '${self.id.toString()}' ${whereStatus}) f 
    inner join 
    warehouse on f."idWarehouse"= warehouse.id::text`;

    const warehouse = await this.warehouseRepository.execute(command);
    return warehouse as Array<Warehouse>;
  }
}
