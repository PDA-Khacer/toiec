import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {WarehouseManagerRepository as IWarehouseManagerRepository} from '../../../domain/repositories/warehouse/warehouse-manager.repository';
import {WarehouseManager} from '../../../domain/models/warehouse/warehouse-manager.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class WarehouseManagerRepository
  extends TimestampRepositoryMixin<
    WarehouseManager,
    typeof WarehouseManager.prototype.id,
    Constructor<
      DefaultCrudRepository<
        WarehouseManager,
        typeof WarehouseManager.prototype.id
      >
    >
  >(DefaultCrudRepository)
  implements IWarehouseManagerRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(WarehouseManager, dataSource);
  }
}
