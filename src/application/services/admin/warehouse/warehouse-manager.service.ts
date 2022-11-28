import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  WarehouseManagerRepository,
  PartnerRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {WarehouseManagerFactory} from '../../../../domain/services/warehouse/warehouse-manager-factory.service';
import {WarehouseManager} from '../../../../domain/models/warehouse/warehouse-manager.model';

@bind()
export class WarehouseManagerService {
  constructor(
    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(WarehouseManagerFactory)
    private warehouseManagerFactory: WarehouseManagerFactory,
  ) {}

  public async createWarehouseManager(
    idSelf: number,
    values: Omit<WarehouseManager, 'id'>,
  ): Promise<boolean> {
    try {
      // check
      await this.getSelf(idSelf);

      // create
      const warehouseManager =
        await this.warehouseManagerFactory.buildWarehouseManager(values);

      await this.checkRequire(warehouseManager);

      await this.warehouseManagerRepository.create(warehouseManager);
      return true;
    } catch (e) {
      console.log(
        '[ERR] src/application/services/admin/warehouse/commodity-unit.service.ts:98',
        e.toString(),
      );
      return false;
    }
  }

  public async initWarehouse(
    idSelf: number,
    idAccount: string,
    idPartner: string,
    idWarehouse: string,
  ): Promise<boolean> {
    const warehouse = {
      idWarehouse: idWarehouse,
      idPartner: idPartner,
      idAccount: idAccount,
    } as WarehouseManager;

    if (await this.checkExisted(warehouse)) {
      throw new HttpErrors.BadRequest('msgExistedManagerWarehouse');
    } else {
      await this.warehouseManagerRepository.create(warehouse);
    }
    return true;
  }

  public async initTenant(
    idSelf: number,
    idAccount: string,
    idPartner: string,
    idTenant: string,
  ): Promise<boolean> {
    const tenant = {
      idTenant: idTenant,
      idPartner: idPartner,
      idAccount: idAccount,
    } as WarehouseManager;

    // TODO: remake
    // if (await this.checkExisted(warehouse)) {
    //   throw new HttpErrors.BadRequest('msgExistedManagerWarehouse');
    // } else {
    //   await this.warehouseManagerRepository.create(warehouse);
    // }

    await this.warehouseManagerRepository.create(tenant);
    return true;
  }

  public async getById(
    idSelf: number,
    idWarehouse: number,
  ): Promise<WarehouseManager> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseManagerRepository
      .findById(idWarehouse)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouseManager');
      });
  }

  public async get(
    idSelf: number,
    filter?: Filter<WarehouseManager>,
  ): Promise<Array<WarehouseManager>> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseManagerRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<WarehouseManager>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseManagerRepository.count(where);
  }

  public async updateWarehouseManager(
    idSelf: number,
    warehouseManagerId: number,
    value: WarehouseManager,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    await this.warehouseManagerRepository.updateById(warehouseManagerId, value);
    return true;
  }

  private async checkRequire(value: WarehouseManager): Promise<boolean> {
    await this.partnerRepository
      .findById(Number(value.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundPartner');
      });

    await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      });

    await this.accountRepository
      .findById(Number(value.idAccount))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundAccount');
      });

    return true;
  }

  private async checkExisted(value: WarehouseManager): Promise<boolean> {
    await this.checkRequire(value);

    const isExisted = await this.warehouseManagerRepository.findOne({
      where: {
        idWarehouse: value.idWarehouse,
        idPartner: value.idPartner,
        idAccount: value.idAccount,
      },
    });
    return !!isExisted;
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
}
