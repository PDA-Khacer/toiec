import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  CommodityUnitRepository,
  PartnerRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {CommodityUnitFactory} from '../../../../domain/services/warehouse/commodity-unit-factory.service';
import {
  CommodityUnit,
  CommodityUnitArea,
  CommodityUnitStatus,
} from '../../../../domain/models/warehouse/commodity-unit.model';
import {CategoryProduct} from '../../../../domain/models/warehouse/category-product.model';

@bind()
export class CommodityUnitService {
  constructor(
    @repository(CommodityUnitRepository)
    private commodityUnitRepository: CommodityUnitRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(CommodityUnitFactory)
    private categoryProductFactory: CommodityUnitFactory,
  ) {}

  public async createCommodityUnit(
    idSelf: number,
    values: Omit<CommodityUnit, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let commodityUnit: CommodityUnit;
    switch (values.area) {
      case CommodityUnitArea.SYSTEM:
        commodityUnit =
          await this.categoryProductFactory.buildCommodityUnitSystem(values);
        break;

      case CommodityUnitArea.WAREHOUSE:
        commodityUnit =
          await this.categoryProductFactory.buildCommodityUnitWarehouse(values);
        break;
    }
    commodityUnit.whoCreate = self.id.toString();

    await this.checkRequire(commodityUnit);

    await this.commodityUnitRepository.create(commodityUnit);
    return true;
  }

  public async getById(
    idSelf: number,
    idWarehouse: number,
  ): Promise<CommodityUnit> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockCommodityUnit(idSelf, idWarehouse))) {
      return this.commodityUnitRepository
        .findById(idWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundCommodityUnit');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<CommodityUnit>,
  ): Promise<Array<CommodityUnit>> {
    // check
    await this.getSelf(idSelf);
    return this.commodityUnitRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<CommodityUnit>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.commodityUnitRepository.count(where);
  }

  public async updateCommodityUnit(
    idSelf: number,
    commodityUnitId: number,
    value: CommodityUnit,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCommodityUnit(idSelf, commodityUnitId, true)) {
      await this.commodityUnitRepository
        .updateById(commodityUnitId, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockCommodityUnit(idSelf, commodityUnitId, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusCommodityUnit(
    idSelf: number,
    commodityUnitId: number,
    status: CommodityUnitStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCommodityUnit(idSelf, commodityUnitId, true)) {
      const value = await this.commodityUnitRepository
        .findById(commodityUnitId)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundCommodityUnit');
        });
      value.status = status;
      await this.commodityUnitRepository
        .updateById(commodityUnitId, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockCommodityUnit(idSelf, commodityUnitId, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockCommodityUnit(
    idSelf: number,
    idCommodityUnit: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const commodityUnit = await this.commodityUnitRepository
      .findById(idCommodityUnit)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCommodityUnit');
      });
    return commodityUnit.isLocked;
  }

  private async lockCommodityUnit(
    idSelf: number,
    idCommodityUnit: number,
    beLock: boolean,
  ): Promise<boolean> {
    const commodityUnit = await this.commodityUnitRepository
      .findById(idCommodityUnit)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCommodityUnit');
      });

    if (beLock) {
      if (commodityUnit.isLocked) {
        throw new HttpErrors.BadRequest('mgsCommodityUnitLocked');
      } else {
        commodityUnit.isLocked = true;
        commodityUnit.whoLocked = String(idSelf);
        commodityUnit.lockedAt = new Date();
      }
    } else {
      if (!commodityUnit.isLocked) {
        throw new HttpErrors.BadRequest('mgsCommodityUnLocked');
      } else {
        commodityUnit.isLocked = false;
      }
    }
    await this.commodityUnitRepository.updateById(
      idCommodityUnit,
      commodityUnit,
    );
    return true;
  }

  private async checkRequire(value: CommodityUnit): Promise<boolean> {
    if (value.area === CommodityUnitArea.SYSTEM) {
      await this.partnerRepository
        .findById(Number(value.idPartner))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundPartner');
        });
    }

    if (value.idWarehouse !== null && value.idWarehouse !== '0') {
      await this.warehouseRepository
        .findById(Number(value.idWarehouse))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundWarehouse');
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

  // functional
  /***
   *
   * @param idSelf
   * @param idWarehouse
   *  get all commodity unit of warehouse, contain system & warehouse
   */
  public async getCommodityUnitOfWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<Array<CommodityUnit>> {
    // check
    await this.getSelf(idSelf);

    const warehouse = await this.warehouseRepository
      .findById(Number(idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      });

    return this.commodityUnitRepository.find({
      where: {
        idWarehouse: idWarehouse,
        idPartner: warehouse.idPartner,
      },
    });
  }

  public async getCommodityUnitOfTenant(
    idSelf: number,
    idTenant: string,
  ): Promise<Array<CommodityUnit>> {
    // check
    await this.getSelf(idSelf);

    await this.partnerRepository.findById(Number(idTenant)).catch(reason => {
      console.log(reason);
      throw new HttpErrors.NotFound('msgNotFoundTenant');
    });

    return this.commodityUnitRepository.find({
      where: {
        idPartner: idTenant,
      },
    });
  }

  public async delete(idSelf: number, id: number): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCommodityUnit(idSelf, id, true)) {
      await this.commodityUnitRepository.deleteById(id).catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundCategory');
      });
      return true;
    }
    return false;
  }

  public async getBySelfInWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<Array<CommodityUnit>> {
    const self = await this.getSelf(idSelf);
    return this.commodityUnitRepository.find({
      where: {idPartner: self.idPartner, idWarehouse: idWarehouse},
    });
  }
}
