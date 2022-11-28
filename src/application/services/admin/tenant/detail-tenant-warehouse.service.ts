import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  DetailTenantWarehouseRepository,
  PartnerRepository,
  SettingPricesRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {
  DetailTenantWarehouseModel,
  DetailTenantWarehouseStatus,
} from '../../../../domain/models/tenant/detail-tenant-warehouse.model';
import {DetailTenantWarehouseFactory} from '../../../../domain/services/tenant/detail-tenant-warehouse-factory.service';

@bind()
export class DetailTenantWarehouseService {
  constructor(
    @repository(DetailTenantWarehouseRepository)
    private detailTenantWarehouseRepository: DetailTenantWarehouseRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(SettingPricesRepository)
    private settingPricesRepository: SettingPricesRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(DetailTenantWarehouseFactory)
    private detailTenantWarehouseFactory: DetailTenantWarehouseFactory,
  ) {}

  public async createDetailTenantWarehouse(
    idSelf: number,
    values: Pick<
      DetailTenantWarehouseModel,
      'idWarehouse' | 'numberSKU' | 'startDate' | 'expDate' | 'code'
    >,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    const detailTenant =
      await this.detailTenantWarehouseFactory.buildDetailTenantWarehouse(
        values,
      );
    detailTenant.idTenant = self.id.toString();

    const setting = await this.settingPricesRepository.findOne({
      where: {idWarehouse: detailTenant.idWarehouse},
    });

    if (setting) {
      if (!setting.autoAccept) {
        detailTenant.status = DetailTenantWarehouseStatus.WAITING;
      } else {
        detailTenant.status = DetailTenantWarehouseStatus.SUCCESS;
        // sub remain
        await this.updateRemaining(
          detailTenant.idWarehouse,
          detailTenant.numberSKU,
        );
      }
    }

    await this.checkRequire(detailTenant);

    detailTenant.whoCreate = self.id.toString();
    await this.detailTenantWarehouseRepository.create(detailTenant);
    return true;
  }

  private async updateRemaining(
    idWarehouse: string,
    numberSKU: string,
  ): Promise<boolean> {
    const warehouse = await this.warehouseRepository
      .findById(Number(idWarehouse))
      .catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      });
    const remainingCapacity =
      Number(warehouse.remainingCapacity) - Number(numberSKU);
    await this.warehouseRepository.updateById(warehouse.id, {
      remainingCapacity: remainingCapacity.toString(),
    });
    return true;
  }

  public async getById(
    idSelf: number,
    idDetailTenantWarehouse: number,
  ): Promise<DetailTenantWarehouseModel> {
    // check
    await this.getSelf(idSelf);
    if (
      !(await this.checkLockDetailTenantWarehouse(
        idSelf,
        idDetailTenantWarehouse,
      ))
    ) {
      return this.detailTenantWarehouseRepository
        .findById(idDetailTenantWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailTenantWarehouse');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<DetailTenantWarehouseModel>,
  ): Promise<Array<DetailTenantWarehouseModel>> {
    // check
    await this.getSelf(idSelf);
    return this.detailTenantWarehouseRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<DetailTenantWarehouseModel>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.detailTenantWarehouseRepository.count(where);
  }

  public async updateDetailTenantWarehouse(
    idSelf: number,
    idDetailTenantWarehouse: number,
    value: DetailTenantWarehouseModel,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (
      await this.lockDetailTenantWarehouse(
        idSelf,
        idDetailTenantWarehouse,
        true,
      )
    ) {
      await this.detailTenantWarehouseRepository
        .updateById(idDetailTenantWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailTenantWarehouse(
            idSelf,
            idDetailTenantWarehouse,
            false,
          );
        });
      return true;
    }
    return false;
  }

  public async updateStatusDetailTenantWarehouse(
    idSelf: number,
    idDetailTenantWarehouse: number,
    status: DetailTenantWarehouseStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (
      await this.lockDetailTenantWarehouse(
        idSelf,
        idDetailTenantWarehouse,
        true,
      )
    ) {
      const value = await this.detailTenantWarehouseRepository
        .findById(idDetailTenantWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailTenantWarehouse');
        });
      value.status = status;
      await this.detailTenantWarehouseRepository
        .updateById(idDetailTenantWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailTenantWarehouse(
            idSelf,
            idDetailTenantWarehouse,
            false,
          );
        });
      if (status === DetailTenantWarehouseStatus.SUCCESS) {
        await this.updateRemaining(value.idWarehouse, value.numberSKU);
      }
      return true;
    }
    return false;
  }

  public async checkLockDetailTenantWarehouse(
    idSelf: number,
    idDetailTenantWarehouse: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.detailTenantWarehouseRepository
      .findById(idDetailTenantWarehouse)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailTenantWarehouse');
      });
    return warehouse.isLocked;
  }

  private async lockDetailTenantWarehouse(
    idSelf: number,
    idDetailTenantWarehouse: number,
    beLock: boolean,
  ): Promise<boolean> {
    const detail = await this.detailTenantWarehouseRepository
      .findById(idDetailTenantWarehouse)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailTenantWarehouse');
      });

    if (beLock) {
      if (detail.isLocked) {
        throw new HttpErrors.BadRequest('mgsDetailTenantWarehouseLocked');
      } else {
        detail.isLocked = true;
        detail.whoLocked = String(idSelf);
        detail.lockedAt = new Date();
      }
    } else {
      if (!detail.isLocked) {
        throw new HttpErrors.BadRequest('mgsDetailTenantWarehouseUnlocked');
      } else {
        detail.isLocked = false;
      }
    }
    await this.detailTenantWarehouseRepository.updateById(
      idDetailTenantWarehouse,
      detail,
    );
    return true;
  }

  private async checkRequire(
    value: DetailTenantWarehouseModel,
  ): Promise<{result: boolean; values: DetailTenantWarehouseModel}> {
    await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsWarehouse');
      });

    await this.accountRepository
      .findById(Number(value.idTenant))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundTenant');
      });

    return {result: true, values: value};
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
