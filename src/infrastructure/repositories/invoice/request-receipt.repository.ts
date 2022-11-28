import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {RequestReceiptRepository as IRequestReceiptRepository} from '../../../domain/repositories/invoice/request-receipt.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {RequestReceipt} from '../../../domain/models/invoice/request-receipt.model';

export class RequestReceiptRepository
  extends TimestampRepositoryMixin<
    RequestReceipt,
    typeof RequestReceipt.prototype.id,
    Constructor<
      DefaultCrudRepository<RequestReceipt, typeof RequestReceipt.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IRequestReceiptRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(RequestReceipt, dataSource);
  }
}
