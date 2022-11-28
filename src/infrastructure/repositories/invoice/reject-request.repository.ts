import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {RejectRequestRepository as IRejectRequestRepository} from '../../../domain/repositories/invoice/reject-request.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {RejectRequest} from '../../../domain/models/invoice/reject-request.model';

export class RejectRequestRepository
  extends TimestampRepositoryMixin<
    RejectRequest,
    typeof RejectRequest.prototype.id,
    Constructor<
      DefaultCrudRepository<RejectRequest, typeof RejectRequest.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IRejectRequestRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(RejectRequest, dataSource);
  }
}
