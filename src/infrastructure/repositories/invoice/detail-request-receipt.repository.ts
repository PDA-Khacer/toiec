import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {DetailRequestReceiptRepository as IDetailRequestReceiptRepository} from '../../../domain/repositories/invoice/detail-request-receipt.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {DetailRequestReceipt} from '../../../domain/models/invoice/detail-request-receipt.model';

export class DetailRequestReceiptRepository
  extends TimestampRepositoryMixin<
    DetailRequestReceipt,
    typeof DetailRequestReceipt.prototype.id,
    Constructor<
      DefaultCrudRepository<
        DetailRequestReceipt,
        typeof DetailRequestReceipt.prototype.id
      >
    >
  >(DefaultCrudRepository)
  implements IDetailRequestReceiptRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(DetailRequestReceipt, dataSource);
  }
}
