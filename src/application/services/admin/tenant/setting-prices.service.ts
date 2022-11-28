import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  SettingPricesRepository,
  WarehouseRepository,
  WarehouseManagerRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {SettingPrices} from '../../../../domain/models/tenant/setting-prices.model';
import {SettingPricesFactory} from '../../../../domain/services/tenant/setting-prices-factory.service';

@bind()
export class SettingPricesService {
  constructor(
    @repository(SettingPricesRepository)
    private settingPricesRepository: SettingPricesRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @service(SettingPricesFactory)
    private settingPricesFactory: SettingPricesFactory,
  ) {}

  public async createSettingPrices(
    idSelf: number,
    values: Omit<SettingPrices, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    console.log(values);
    // create
    const detailTenant = await this.settingPricesFactory.buildSettingPrices(
      values,
    );
    console.log(detailTenant);

    detailTenant.idWarehouse = await this.getIdWarehouseManager(idSelf);

    // check created ?
    const setting = await this.settingPricesRepository.findOne({
      where: {idWarehouse: detailTenant.idWarehouse},
    });

    if (setting) {
      throw new HttpErrors.BadRequest('msgExistedSetting');
    }

    await this.checkRequire(detailTenant);

    detailTenant.whoCreate = self.id.toString();
    console.log(detailTenant);
    await this.settingPricesRepository.create(detailTenant);
    return true;
  }

  public async getSettingWarehouseBySelf(
    idSelf: number,
    canNull?: boolean,
  ): Promise<SettingPrices | null> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockSettingPricesBySelf(idSelf, canNull))) {
      const idWarehouse = await this.getIdWarehouseManager(idSelf);

      return this.settingPricesRepository.findOne({
        where: {idWarehouse: idWarehouse},
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async getById(
    idSelf: number,
    idSettingPrices: number,
  ): Promise<SettingPrices> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockSettingPrices(idSelf, idSettingPrices))) {
      return this.settingPricesRepository
        .findById(idSettingPrices)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundSettingPrices');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async getByIdWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<SettingPrices> {
    // check
    await this.getSelf(idSelf);
    const re = await this.settingPricesRepository.findOne({
      where: {idWarehouse: idWarehouse},
    });
    if (re) {
      return re;
    } else {
      throw new HttpErrors.NotFound('msgNotFoundSetting');
    }
  }

  public async get(
    idSelf: number,
    filter?: Filter<SettingPrices>,
  ): Promise<Array<SettingPrices>> {
    // check
    await this.getSelf(idSelf);
    return this.settingPricesRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<SettingPrices>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.settingPricesRepository.count(where);
  }

  public async updateSettingPrices(
    idSelf: number,
    idSettingPrices: number,
    value: SettingPrices,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockSettingPrices(idSelf, idSettingPrices, true)) {
      await this.settingPricesRepository
        .updateById(idSettingPrices, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockSettingPrices(idSelf, idSettingPrices, false);
        });
      return true;
    }
    return false;
  }

  public async updateSettingPricesWarehouseBySelf(
    idSelf: number,
    value: SettingPrices,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (!(await this.checkLockSettingPricesBySelf(idSelf))) {
      const idWarehouse = await this.getIdWarehouseManager(idSelf);

      const setting = await this.settingPricesRepository.findOne({
        where: {idWarehouse: idWarehouse},
      });

      if (!setting) {
        throw new HttpErrors.NotFound('msgNotFoundSetting');
      }
      await this.settingPricesRepository
        .updateById(setting.id, value)
        .finally(async () => {
          // unlock setting
          // await this.lockSettingPrices(idSelf, setting.id, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockSettingPrices(
    idSelf: number,
    idSettingPrices: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.settingPricesRepository
      .findById(idSettingPrices)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundSettingPrices');
      });
    return warehouse.isLocked;
  }

  public async checkLockSettingPricesBySelf(
    idSelf: number,
    canNull?: boolean,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);

    const manager = await this.warehouseManagerRepository.findOne({
      where: {idAccount: idSelf.toString()},
    });

    if (!manager || !manager.idWarehouse) {
      throw new HttpErrors.NotFound('msgNotFoundWarehouseManager');
    }

    // get lock
    const setting = await this.settingPricesRepository.findOne({
      where: {idWarehouse: manager.idWarehouse},
    });

    if (!setting) {
      if (canNull) {
        return false;
      }
      throw new HttpErrors.NotFound('msgNotFoundSetting');
    }
    return setting.isLocked;
  }

  private async lockSettingPrices(
    idSelf: number,
    idSettingPrices: number,
    beLock: boolean,
  ): Promise<boolean> {
    const setting = await this.settingPricesRepository
      .findById(idSettingPrices)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundSettingPrices');
      });

    if (beLock) {
      if (setting.isLocked) {
        throw new HttpErrors.BadRequest('mgsSettingPricesLocked');
      } else {
        setting.isLocked = true;
        setting.whoLocked = String(idSelf);
        setting.lockedAt = new Date();
      }
    } else {
      if (!setting.isLocked) {
        throw new HttpErrors.BadRequest('mgsSettingPricesUnLocked');
      } else {
        setting.isLocked = false;
      }
    }
    await this.settingPricesRepository.updateById(idSettingPrices, setting);
    return true;
  }

  private async checkRequire(
    value: SettingPrices,
  ): Promise<{result: boolean; values: SettingPrices}> {
    return {result: true, values: value};
  }

  private async getIdWarehouseManager(idSelf: number): Promise<string> {
    const manager = await this.warehouseManagerRepository.findOne({
      where: {idAccount: idSelf.toString()},
    });

    if (!manager || !manager.idWarehouse) {
      throw new HttpErrors.NotFound('msgNotFoundWarehouseManager');
    }
    return manager.idWarehouse;
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
