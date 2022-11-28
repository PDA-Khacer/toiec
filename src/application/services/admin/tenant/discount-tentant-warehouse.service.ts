import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  DiscountPricesRepository,
  WarehouseRepository,
  WarehouseManagerRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {
  DiscountPrices,
  DiscountPricesStatus,
} from '../../../../domain/models/tenant/discount-prices.model';
import {DiscountPricesFactory} from '../../../../domain/services/tenant/discount-prices-factory.service';

@bind()
export class DiscountPricesService {
  constructor(
    @repository(DiscountPricesRepository)
    private discountPricesRepository: DiscountPricesRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @service(DiscountPricesFactory)
    private discountPricesFactory: DiscountPricesFactory,
  ) {}

  public async createDiscountPrices(
    idSelf: number,
    values: Pick<DiscountPrices, 'discount' | 'timeStart' | 'timeEnd'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    if (values.timeStart > values.timeEnd) {
      throw new HttpErrors.NotFound('msgTimeError');
    }

    // create
    const detailTenant = await this.discountPricesFactory.buildDiscountPrices(
      values,
    );

    const manager = await this.warehouseManagerRepository.findOne({
      where: {idAccount: self.id.toString()},
    });

    if (!manager || !manager.idWarehouse) {
      throw new HttpErrors.NotFound('msgNotFoundWarehouseManager');
    }

    detailTenant.idWarehouse = manager.idWarehouse;

    await this.checkRequire(detailTenant);

    detailTenant.whoCreate = self.id.toString();
    await this.discountPricesRepository.create(detailTenant);
    return true;
  }

  public async getById(
    idSelf: number,
    idDiscountPrices: number,
  ): Promise<DiscountPrices> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockDiscountPrices(idSelf, idDiscountPrices))) {
      return this.discountPricesRepository
        .findById(idDiscountPrices)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDiscountPrices');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<DiscountPrices>,
  ): Promise<Array<DiscountPrices>> {
    // check
    await this.getSelf(idSelf);
    return this.discountPricesRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<DiscountPrices>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.discountPricesRepository.count(where);
  }

  public async updateDiscountPrices(
    idSelf: number,
    idDiscountPrices: number,
    value: DiscountPrices,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockDiscountPrices(idSelf, idDiscountPrices, true)) {
      await this.discountPricesRepository
        .updateById(idDiscountPrices, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDiscountPrices(idSelf, idDiscountPrices, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusDiscountPrices(
    idSelf: number,
    idDiscountPrices: number,
    status: DiscountPricesStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockDiscountPrices(idSelf, idDiscountPrices, true)) {
      const value = await this.discountPricesRepository
        .findById(idDiscountPrices)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDiscountPrices');
        });
      if (status) {
        await this.inactiveAll();
      }
      value.status = status;
      await this.discountPricesRepository
        .updateById(idDiscountPrices, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDiscountPrices(idSelf, idDiscountPrices, false);
        });
      return true;
    }
    return false;
  }

  private async inactiveAll() {
    await this.discountPricesRepository.execute(
      `update "discount-prices" set status = '${DiscountPricesStatus.INACTIVE}'`,
    );
  }

  public async checkLockDiscountPrices(
    idSelf: number,
    idDiscountPrices: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.discountPricesRepository
      .findById(idDiscountPrices)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDiscountPrices');
      });
    return warehouse.isLocked;
  }

  private async lockDiscountPrices(
    idSelf: number,
    idDiscountPrices: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.discountPricesRepository
      .findById(idDiscountPrices)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDiscountPrices');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsDiscountPricesLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.discountPricesRepository.updateById(idDiscountPrices, receipt);
      return true;
    }
  }

  private async checkRequire(
    value: DiscountPrices,
  ): Promise<{result: boolean; values: DiscountPrices}> {
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
