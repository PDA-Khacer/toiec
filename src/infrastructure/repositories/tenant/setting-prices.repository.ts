import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {SettingPricesRepository as ISettingPricesRepository} from '../../../domain/repositories/tenant/setting-prices.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {SettingPrices} from '../../../domain/models/tenant/setting-prices.model';

export class SettingPricesRepository
  extends TimestampRepositoryMixin<
    SettingPrices,
    typeof SettingPrices.prototype.id,
    Constructor<
      DefaultCrudRepository<SettingPrices, typeof SettingPrices.prototype.id>
    >
  >(DefaultCrudRepository)
  implements ISettingPricesRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(SettingPrices, dataSource);
  }
}
