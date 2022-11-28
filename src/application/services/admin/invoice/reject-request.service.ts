import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  WarehouseRepository,
  RejectRequestRepository,
  RequestReceiptRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {RejectRequestFactory} from '../../../../domain/services/invoice/reject-request-factory.service';
import {RejectRequestBody} from '../../../../domain/models/rest/request/request-receipt.body';
import {RequestReceiptStatus} from '../../../../domain/models/invoice/request-receipt.model';
import {RejectRequest} from '../../../../domain/models/invoice/reject-request.model';

@bind()
export class RejectRequestService {
  constructor(
    @repository(RejectRequestRepository)
    private rejectRequestRepository: RejectRequestRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(RequestReceiptRepository)
    private requestReceiptRepository: RequestReceiptRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(RejectRequestFactory)
    private rejectRequestFactory: RejectRequestFactory,
  ) {}

  public async rejectRequest(
    idSelf: number,
    values: RejectRequestBody,
  ): Promise<RejectRequest> {
    await this.getSelf(idSelf);

    const request = await this.requestReceiptRepository
      .findById(Number(values.idRequest))
      .catch(reason => {
        console.log(reason.toString());
        throw new HttpErrors.NotFound('msgNotFoundRequestReceipt');
      });

    /* Create Account */
    const reject: Pick<
      RejectRequest,
      'note' | 'reason' | 'idRequest' | 'idTenant' | 'idWarehouse'
    > = {
      note: values.note,
      reason: values.reason,
      idRequest: values.idRequest,
      idTenant: request.idTenant,
      idWarehouse: request.idWarehouse,
    };

    await this.checkRequire({
      idWarehouse: reject.idWarehouse,
      idTenant: reject.idTenant,
      idRequest: values.idRequest,
    });

    const build = await this.rejectRequestFactory.buildRejectRequest(reject);
    build.whoCreate = idSelf.toString();
    const rejectSuccess = this.rejectRequestRepository.create(build);

    // update status request
    request.status = RequestReceiptStatus.REJECT;
    await this.requestReceiptRepository.updateById(request.id, request);
    // schedule
    return rejectSuccess;
  }

  public async get(
    idSelf: number,
    filter?: Filter<RejectRequest>,
  ): Promise<Array<RejectRequest>> {
    // check
    await this.getSelf(idSelf);
    return this.rejectRequestRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<RejectRequest>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.rejectRequestRepository.count(where);
  }

  private async checkRequire(
    value:
      | RejectRequest
      | {idWarehouse?: string; idTenant?: string; idRequest?: string},
  ): Promise<{
    result: boolean;
    values:
      | RejectRequest
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
