import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {BillPaymentRepository as IBillPaymentRepository} from '../../../domain/repositories/tenant/bill-payment.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {BillPayment} from '../../../domain/models/tenant/bill-payment';

export class BillPaymentRepository
  extends TimestampRepositoryMixin<
    BillPayment,
    typeof BillPayment.prototype.id,
    Constructor<
      DefaultCrudRepository<BillPayment, typeof BillPayment.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IBillPaymentRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(BillPayment, dataSource);
  }
}
