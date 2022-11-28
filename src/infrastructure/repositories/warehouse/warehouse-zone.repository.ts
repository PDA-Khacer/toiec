import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {WarehouseZoneRepository as IWarehouseZoneRepository} from '../../../domain/repositories/warehouse/warehouse-zone.repository';
import {WarehouseZone} from '../../../domain/models/warehouse/warehouse-zone.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class WarehouseZoneRepository
  extends TimestampRepositoryMixin<
    WarehouseZone,
    typeof WarehouseZone.prototype.id,
    Constructor<
      DefaultCrudRepository<WarehouseZone, typeof WarehouseZone.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IWarehouseZoneRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(WarehouseZone, dataSource);
  }
}
