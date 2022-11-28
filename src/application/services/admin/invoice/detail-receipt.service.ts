import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  DetailReceiptRepository,
  WarehouseRepository,
  ProductZoneRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {DetailReceiptFactory} from '../../../../domain/services/invoice/detail-receipt-factory.service';
import {
  DetailReceipt,
  DetailReceiptStatus,
  DetailReceiptType,
} from '../../../../domain/models/invoice/detail-receipt.model';

@bind()
export class DetailReceiptService {
  constructor(
    @repository(DetailReceiptRepository)
    private detailReceiptRepository: DetailReceiptRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(ProductZoneRepository)
    private productZoneRepository: ProductZoneRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(DetailReceiptFactory)
    private detailReceiptFactory: DetailReceiptFactory,
  ) {}

  public async createDetailReceipt(
    idSelf: number,
    values: Omit<DetailReceipt, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let product;
    if (values.receiptType === DetailReceiptType.IMPORT) {
      product = await this.detailReceiptFactory.buildDetailImportReceipt(
        values,
      );
    } else {
      product = await this.detailReceiptFactory.buildDetailExportReceipt(
        values,
      );
    }

    await this.checkRequire(product);

    product.whoCreate = self.id.toString();
    await this.detailReceiptRepository.create(product);
    return true;
  }

  public async getById(
    idSelf: number,
    idDetailReceipt: number,
  ): Promise<DetailReceipt> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockDetailReceipt(idSelf, idDetailReceipt))) {
      return this.detailReceiptRepository
        .findById(idDetailReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailReceipt');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<DetailReceipt>,
  ): Promise<Array<DetailReceipt>> {
    // check
    await this.getSelf(idSelf);
    return this.detailReceiptRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<DetailReceipt>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.detailReceiptRepository.count(where);
  }

  public async updateDetailReceipt(
    idSelf: number,
    idDetailReceipt: number,
    value: DetailReceipt,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockDetailReceipt(idSelf, idDetailReceipt, true)) {
      await this.detailReceiptRepository
        .updateById(idDetailReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailReceipt(idSelf, idDetailReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusDetailReceipt(
    idSelf: number,
    idDetailReceipt: number,
    status: DetailReceiptStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockDetailReceipt(idSelf, idDetailReceipt, true)) {
      const value = await this.detailReceiptRepository
        .findById(idDetailReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailReceipt');
        });
      value.status = status;
      await this.detailReceiptRepository
        .updateById(idDetailReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailReceipt(idSelf, idDetailReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockDetailReceipt(
    idSelf: number,
    idDetailReceipt: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.detailReceiptRepository
      .findById(idDetailReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailReceipt');
      });
    return warehouse.isLocked;
  }

  private async lockDetailReceipt(
    idSelf: number,
    idDetailReceipt: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.detailReceiptRepository
      .findById(idDetailReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailReceipt');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsDetailReceiptLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.detailReceiptRepository.updateById(idDetailReceipt, receipt);
      return true;
    }
  }

  private async checkRequire(
    value: DetailReceipt,
  ): Promise<{result: boolean; values: DetailReceipt}> {
    await this.productZoneRepository
      .findById(Number(value.idProductZone))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsProduct');
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
