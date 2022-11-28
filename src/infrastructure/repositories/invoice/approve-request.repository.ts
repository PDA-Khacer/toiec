import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {ApproveRequestRepository as IApproveRequestRepository} from '../../../domain/repositories/invoice/approve-request.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {ApproveRequest} from '../../../domain/models/invoice/approve-request.model';

export class ApproveRequestRepository
  extends TimestampRepositoryMixin<
    ApproveRequest,
    typeof ApproveRequest.prototype.id,
    Constructor<
      DefaultCrudRepository<ApproveRequest, typeof ApproveRequest.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IApproveRequestRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(ApproveRequest, dataSource);
  }
}
