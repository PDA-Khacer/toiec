import {bind} from '@loopback/context';
import {ApproveRequest} from '../../models/invoice/approve-request.model';

@bind()
export class ApproveRequestFactory {
  constructor() {} // private productRepository: ApproveRequestRepository, // @repository('ApproveRequestRepository')

  public async buildApproveRequest(
    values: Pick<ApproveRequest, 'expectedTime'>,
  ): Promise<ApproveRequest> {
    return new ApproveRequest({
      ...values,
    });
  }
}
