import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {WarehouseRepository as IWarehouseRepository} from '../../../domain/repositories/warehouse/warehouse.repository';
import {Warehouse} from '../../../domain/models/warehouse/warehouse.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class WarehouseRepository
  extends TimestampRepositoryMixin<
    Warehouse,
    typeof Warehouse.prototype.id,
    Constructor<DefaultCrudRepository<Warehouse, typeof Warehouse.prototype.id>>
  >(DefaultCrudRepository)
  implements IWarehouseRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(Warehouse, dataSource);
  }
}
