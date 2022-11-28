import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  WarehouseRepository,
  ProductZoneRepository,
  WarehouseZoneRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {ProductZoneFactory} from '../../../../domain/services/warehouse/product-zone-factory.service';
import {
  ProductZone,
  ProductZoneStatus,
} from '../../../../domain/models/warehouse/product-zone.model';

@bind()
export class ProductZoneService {
  constructor(
    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(ProductZoneRepository)
    private productZoneRepository: ProductZoneRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(WarehouseZoneRepository)
    private warehouseZoneRepository: WarehouseZoneRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(ProductZoneFactory)
    private productZoneFactory: ProductZoneFactory,
  ) {}

  public async createProductZone(
    idSelf: number,
    values: Omit<ProductZone, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    const product = await this.productZoneFactory.buildProductZone(values);

    await this.checkRequire(product);

    product.whoCreate = self.id.toString();
    await this.productZoneRepository.create(product);
    return true;
  }

  public async getById(
    idSelf: number,
    idWarehouse: number,
  ): Promise<ProductZone> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockProductZone(idSelf, idWarehouse))) {
      return this.productZoneRepository.findById(idWarehouse).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProductZone');
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<ProductZone>,
  ): Promise<Array<ProductZone>> {
    // check
    await this.getSelf(idSelf);
    return this.productZoneRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<ProductZone>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.productZoneRepository.count(where);
  }

  public async updateProductZone(
    idSelf: number,
    idWarehouse: number,
    value: ProductZone,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockProductZone(idSelf, idWarehouse, true)) {
      await this.productZoneRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockProductZone(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusProductZone(
    idSelf: number,
    idWarehouse: number,
    status: ProductZoneStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockProductZone(idSelf, idWarehouse, true)) {
      const value = await this.productZoneRepository
        .findById(idWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundProductZone');
        });
      value.status = status;
      await this.productZoneRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockProductZone(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockProductZone(
    idSelf: number,
    idProductZone: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.productZoneRepository
      .findById(idProductZone)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProductZone');
      });
    return warehouse.isLocked;
  }

  private async lockProductZone(
    idSelf: number,
    idProductZone: number,
    beLock: boolean,
  ): Promise<boolean> {
    const productZone = await this.productZoneRepository
      .findById(idProductZone)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProductZone');
      });

    if (beLock) {
      if (productZone.isLocked) {
        throw new HttpErrors.BadRequest('mgsProductLocked');
      } else {
        productZone.isLocked = true;
        productZone.whoLocked = String(idSelf);
        productZone.lockedAt = new Date();
      }
    } else {
      if (!productZone.isLocked) {
        throw new HttpErrors.BadRequest('mgsProductUnLocked');
      } else {
        productZone.isLocked = false;
      }
    }
    await this.productZoneRepository.updateById(idProductZone, productZone);
    return true;
  }

  private async checkRequire(
    value: ProductZone,
  ): Promise<{result: boolean; values: ProductZone}> {
    const zone = await this.warehouseZoneRepository
      .findById(Number(value.idZone))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundWarehouseZone');
      });

    value.idWarehouse = zone.idWarehouse;

    const warehouse = await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      });

    value.idPartner = warehouse.idPartner;

    await this.partnerRepository
      .findById(Number(value.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundPartner');
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
