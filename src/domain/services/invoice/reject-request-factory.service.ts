import {bind} from '@loopback/context';
import {RejectRequest} from '../../models/invoice/reject-request.model';

@bind()
export class RejectRequestFactory {
  constructor() {} // private productRepository: RejectRequestRepository, // @repository('RejectRequestRepository')

  public async buildRejectRequest(
    values: Pick<RejectRequest, 'reason'>,
  ): Promise<RejectRequest> {
    return new RejectRequest({
      ...values,
    });
  }
}
