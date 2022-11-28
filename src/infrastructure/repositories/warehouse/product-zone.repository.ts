import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {ProductZoneRepository as IProductZoneRepository} from '../../../domain/repositories/warehouse/product-zone.repository';
import {ProductZone} from '../../../domain/models/warehouse/product-zone.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class ProductZoneRepository
  extends TimestampRepositoryMixin<
    ProductZone,
    typeof ProductZone.prototype.id,
    Constructor<
      DefaultCrudRepository<ProductZone, typeof ProductZone.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IProductZoneRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(ProductZone, dataSource);
  }
}
