import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {ShipCodRepository as IShipCODRepository} from '../../../domain/repositories/invoice/ship-cod.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {ShipCOD} from '../../../domain/models/invoice/ship-cod.model';

export class ShipCODRepository
  extends TimestampRepositoryMixin<
    ShipCOD,
    typeof ShipCOD.prototype.id,
    Constructor<DefaultCrudRepository<ShipCOD, typeof ShipCOD.prototype.id>>
  >(DefaultCrudRepository)
  implements IShipCODRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(ShipCOD, dataSource);
  }
}
