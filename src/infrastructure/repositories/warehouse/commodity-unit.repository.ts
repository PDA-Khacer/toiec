import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {CommodityUnitRepository as ICommodityUnitRepository} from '../../../domain/repositories/warehouse/commodity-unit.repository';
import {CommodityUnit} from '../../../domain/models/warehouse/commodity-unit.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class CommodityUnitRepository
  extends TimestampRepositoryMixin<
    CommodityUnit,
    typeof CommodityUnit.prototype.id,
    Constructor<
      DefaultCrudRepository<CommodityUnit, typeof CommodityUnit.prototype.id>
    >
  >(DefaultCrudRepository)
  implements ICommodityUnitRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(CommodityUnit, dataSource);
  }
}
