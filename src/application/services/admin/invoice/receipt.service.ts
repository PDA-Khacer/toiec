import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  ReceiptRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {
  Receipt,
  ReceiptStatus,
  ReceiptType,
} from '../../../../domain/models/invoice/receipt.model';
import {ReceiptFactory} from '../../../../domain/services/invoice/receipt-factory.service';

@bind()
export class ReceiptService {
  constructor(
    @repository(ReceiptRepository)
    private receiptRepository: ReceiptRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(ReceiptFactory)
    private receiptFactory: ReceiptFactory,
  ) {}

  public async createReceipt(
    idSelf: number,
    values: Omit<Receipt, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let product;
    if (values.receiptType === ReceiptType.IMPORT) {
      product = await this.receiptFactory.buildImportReceipt(values);
    } else {
      product = await this.receiptFactory.buildExportReceipt(values);
    }

    await this.checkRequire(product);

    product.whoCreate = self.id.toString();
    await this.receiptRepository.create(product);
    return true;
  }

  public async getById(idSelf: number, idReceipt: number): Promise<Receipt> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockReceipt(idSelf, idReceipt))) {
      return this.receiptRepository.findById(idReceipt).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundReceipt');
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<Receipt>,
  ): Promise<Array<Receipt>> {
    // check
    await this.getSelf(idSelf);
    return this.receiptRepository.find(filter);
  }

  public async count(idSelf: number, where?: Where<Receipt>): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.receiptRepository.count(where);
  }

  public async updateReceipt(
    idSelf: number,
    idReceipt: number,
    value: Receipt,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockReceipt(idSelf, idReceipt, true)) {
      await this.receiptRepository
        .updateById(idReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockReceipt(idSelf, idReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusReceipt(
    idSelf: number,
    idReceipt: number,
    status: ReceiptStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockReceipt(idSelf, idReceipt, true)) {
      const value = await this.receiptRepository
        .findById(idReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundReceipt');
        });
      value.status = status;
      await this.receiptRepository
        .updateById(idReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockReceipt(idSelf, idReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockReceipt(
    idSelf: number,
    idReceipt: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.receiptRepository
      .findById(idReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundReceipt');
      });
    return warehouse.isLocked;
  }

  private async lockReceipt(
    idSelf: number,
    idReceipt: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.receiptRepository
      .findById(idReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundReceipt');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsReceiptLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.receiptRepository.updateById(idReceipt, receipt);
      return true;
    }
  }

  private async checkRequire(
    value: Receipt,
  ): Promise<{result: boolean; values: Receipt}> {
    const warehouse = await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsWarehouse');
      });

    await this.partnerRepository
      .findById(Number(warehouse.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundPartner');
      });

    value.idPartner = warehouse.idPartner;

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
