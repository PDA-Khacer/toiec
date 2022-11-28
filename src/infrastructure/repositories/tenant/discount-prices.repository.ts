import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {DiscountPricesRepository as IDiscountPricesRepository} from '../../../domain/repositories/tenant/discount-prices.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {DiscountPrices} from '../../../domain/models/tenant/discount-prices.model';

export class DiscountPricesRepository
  extends TimestampRepositoryMixin<
    DiscountPrices,
    typeof DiscountPrices.prototype.id,
    Constructor<
      DefaultCrudRepository<DiscountPrices, typeof DiscountPrices.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IDiscountPricesRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(DiscountPrices, dataSource);
  }
}
