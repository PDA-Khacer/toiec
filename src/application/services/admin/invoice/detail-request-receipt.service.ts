import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  DetailRequestReceiptRepository,
  WarehouseRepository,
  ProductZoneRepository,
  RequestReceiptRepository,
  RejectRequestRepository,
  ApproveRequestRepository,
  DetailLoadingProductRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {DetailRequestReceiptFactory} from '../../../../domain/services/invoice/detail-request-receipt-factory.service';
import {
  DetailRequestReceipt,
  InspectionStatus,
} from '../../../../domain/models/invoice/detail-request-receipt.model';
import {HistoryDetailRequestReceipt} from '../../../../domain/models/rest/request/loading-product.body';

@bind()
export class DetailRequestReceiptService {
  constructor(
    @repository(DetailRequestReceiptRepository)
    private detailRequestReceiptRepository: DetailRequestReceiptRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(ProductZoneRepository)
    private productZoneRepository: ProductZoneRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(RejectRequestRepository)
    private rejectRequestRepository: RejectRequestRepository,

    @repository(ApproveRequestRepository)
    private approveRequestRepository: ApproveRequestRepository,

    @repository(DetailLoadingProductRepository)
    private detailLoadingProductRepository: DetailLoadingProductRepository,

    @repository(RequestReceiptRepository)
    private requestReceiptRepository: RequestReceiptRepository,

    @service(DetailRequestReceiptFactory)
    private detailRequestReceiptFactory: DetailRequestReceiptFactory,
  ) {}

  public async createDetailRequestReceipt(
    idSelf: number,
    values: Omit<DetailRequestReceipt, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    const detailRequest =
      await this.detailRequestReceiptFactory.buildDetailRequestReceipt(values);

    await this.checkRequire(detailRequest);

    detailRequest.whoCreate = self.id.toString();
    await this.detailRequestReceiptRepository.create(detailRequest);
    return true;
  }

  public async getById(
    idSelf: number,
    idDetailRequestReceipt: number,
  ): Promise<DetailRequestReceipt> {
    // check
    await this.getSelf(idSelf);
    if (
      !(await this.checkLockDetailRequestReceipt(
        idSelf,
        idDetailRequestReceipt,
      ))
    ) {
      return this.detailRequestReceiptRepository
        .findById(idDetailRequestReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailRequestReceipt');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<DetailRequestReceipt>,
  ): Promise<Array<DetailRequestReceipt>> {
    // check
    await this.getSelf(idSelf);
    return this.detailRequestReceiptRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<DetailRequestReceipt>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.detailRequestReceiptRepository.count(where);
  }

  public async updateDetailRequestReceipt(
    idSelf: number,
    idDetailRequestReceipt: number,
    value: DetailRequestReceipt,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (
      await this.lockDetailRequestReceipt(idSelf, idDetailRequestReceipt, true)
    ) {
      await this.detailRequestReceiptRepository
        .updateById(idDetailRequestReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailRequestReceipt(
            idSelf,
            idDetailRequestReceipt,
            false,
          );
        });
      return true;
    }
    return false;
  }

  public async updateStatusDetailRequestReceipt(
    idSelf: number,
    idDetailRequestReceipt: number,
    status: InspectionStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (
      await this.lockDetailRequestReceipt(idSelf, idDetailRequestReceipt, true)
    ) {
      const value = await this.detailRequestReceiptRepository
        .findById(idDetailRequestReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundDetailRequestReceipt');
        });
      value.inspectionStatus = status;
      await this.detailRequestReceiptRepository
        .updateById(idDetailRequestReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockDetailRequestReceipt(
            idSelf,
            idDetailRequestReceipt,
            false,
          );
        });
      return true;
    }
    return false;
  }

  public async checkLockDetailRequestReceipt(
    idSelf: number,
    idDetailRequestReceipt: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.detailRequestReceiptRepository
      .findById(idDetailRequestReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailRequestReceipt');
      });
    return warehouse.isLocked;
  }

  private async lockDetailRequestReceipt(
    idSelf: number,
    idDetailRequestReceipt: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.detailRequestReceiptRepository
      .findById(idDetailRequestReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundDetailRequestReceipt');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsDetailRequestReceiptLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.detailRequestReceiptRepository.updateById(
        idDetailRequestReceipt,
        receipt,
      );
      return true;
    }
  }

  private async checkRequire(
    value: DetailRequestReceipt,
  ): Promise<{result: boolean; values: DetailRequestReceipt}> {
    await this.productZoneRepository
      .findById(Number(value.idProduct))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsProduct');
      });
    await this.requestReceiptRepository
      .findById(Number(value.idReceipt))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsReceipt');
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

  public async getDetailInfoRequest(
    idSelf: number,
    idRequest: string,
  ): Promise<HistoryDetailRequestReceipt> {
    await this.getSelf(idSelf);
    const request = await this.requestReceiptRepository
      .findById(Number(idRequest))
      .catch(() => {
        throw new HttpErrors.BadRequest('msgNotFoundRequestReceipt');
      });

    // reject
    const reject = await this.rejectRequestRepository.findOne({
      where: {idRequest: idRequest},
    });

    const approve = await this.approveRequestRepository.findOne({
      where: {idRequest: idRequest},
    });

    const loading = await this.detailLoadingProductRepository.find({
      where: {idRequest: idRequest},
    });
    return {
      basic: request,
      reject: reject,
      loading: loading,
      approve: approve,
    };
  }
}
