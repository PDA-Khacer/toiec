import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {DetailReceiptRepository as IDetailReceiptRepository} from '../../../domain/repositories/invoice/detail-receipt.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {DetailReceipt} from '../../../domain/models/invoice/detail-receipt.model';

export class DetailReceiptRepository
  extends TimestampRepositoryMixin<
    DetailReceipt,
    typeof DetailReceipt.prototype.id,
    Constructor<
      DefaultCrudRepository<DetailReceipt, typeof DetailReceipt.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IDetailReceiptRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(DetailReceipt, dataSource);
  }
}
