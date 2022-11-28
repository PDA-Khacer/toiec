import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  WarehouseRepository,
  ApproveRequestRepository,
  RequestReceiptRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {ApproveRequest} from '../../../../domain/models/invoice/approve-request.model';
import {ApproveRequestFactory} from '../../../../domain/services/invoice/approve-request-factory.service';
import {ApproveRequestBody} from '../../../../domain/models/rest/request/request-receipt.body';
import {RequestReceiptStatus} from '../../../../domain/models/invoice/request-receipt.model';

@bind()
export class ApproveRequestService {
  constructor(
    @repository(ApproveRequestRepository)
    private approveRequestRepository: ApproveRequestRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(RequestReceiptRepository)
    private requestReceiptRepository: RequestReceiptRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(ApproveRequestFactory)
    private approveRequestFactory: ApproveRequestFactory,
  ) {}

  public async approveRequest(
    idSelf: number,
    values: ApproveRequestBody,
  ): Promise<ApproveRequest> {
    await this.getSelf(idSelf);

    const request = await this.requestReceiptRepository
      .findById(Number(values.idRequest))
      .catch(reason => {
        console.log(reason.toString());
        throw new HttpErrors.NotFound('msgNotFoundRequestReceipt');
      });

    /* Create Account */
    const approveCer: Pick<
      ApproveRequest,
      | 'note'
      | 'tag'
      | 'expectedTime'
      | 'idRequest'
      | 'isAutoArrange'
      | 'whoCreate'
      | 'idTenant'
      | 'idWarehouse'
    > = {
      note: values.note,
      tag: values.tag,
      expectedTime: values.expectedTime,
      idRequest: values.idRequest,
      isAutoArrange: values.isAutoArrange,
      whoCreate: values.whoCreate,
      idTenant: request.idTenant,
      idWarehouse: request.idWarehouse,
    };

    await this.checkRequire({
      idWarehouse: approveCer.idWarehouse,
      idTenant: approveCer.idTenant,
      idRequest: values.idRequest,
    });

    const build = await this.approveRequestFactory.buildApproveRequest(
      approveCer,
    );
    build.whoApprove = idSelf.toString();
    const approveSuccess = this.approveRequestRepository.create(build);

    // update status request
    request.status = RequestReceiptStatus.APPROVE;
    await this.requestReceiptRepository.updateById(request.id, request);
    // schedule
    return approveSuccess;
  }

  public async get(
    idSelf: number,
    filter?: Filter<ApproveRequest>,
  ): Promise<Array<ApproveRequest>> {
    // check
    await this.getSelf(idSelf);
    return this.approveRequestRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<ApproveRequest>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.approveRequestRepository.count(where);
  }

  public async updateApproveRequest(
    idSelf: number,
    idApproveRequest: number,
    value: ApproveRequest,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockApproveRequest(idSelf, idApproveRequest, true)) {
      await this.approveRequestRepository
        .updateById(idApproveRequest, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockApproveRequest(idSelf, idApproveRequest, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockApproveRequest(
    idSelf: number,
    idApproveRequest: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.approveRequestRepository
      .findById(idApproveRequest)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundApproveRequest');
      });
    return warehouse.isLocked;
  }

  private async lockApproveRequest(
    idSelf: number,
    idApproveRequest: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.approveRequestRepository
      .findById(idApproveRequest)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundApproveRequest');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsApproveRequestLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.approveRequestRepository.updateById(idApproveRequest, receipt);
      return true;
    }
  }

  private async checkRequire(
    value:
      | ApproveRequest
      | {idWarehouse?: string; idTenant?: string; idRequest?: string},
  ): Promise<{
    result: boolean;
    values:
      | ApproveRequest
      | {idWarehouse?: string; idTenant?: string; idRequest?: string};
  }> {
    await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });

    await this.partnerRepository
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
