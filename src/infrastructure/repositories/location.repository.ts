import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {LocationRepository as ILocationRepository} from '../../domain/repositories/location.repository';
import {Location} from '../../domain/models/location.model';
import {TimestampRepositoryMixin} from './mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../keys';

export class LocationRepository
  extends TimestampRepositoryMixin<
    Location,
    typeof Location.prototype.id,
    Constructor<DefaultCrudRepository<Location, typeof Location.prototype.id>>
  >(DefaultCrudRepository)
  implements ILocationRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(Location, dataSource);
  }
}
