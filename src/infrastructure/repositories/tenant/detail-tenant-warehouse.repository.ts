import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {DetailTenantWarehouseRepository as IDetailTenantWarehouseRepository} from '../../../domain/repositories/tenant/detail-tenant-warehouse.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {DetailTenantWarehouseModel} from '../../../domain/models/tenant/detail-tenant-warehouse.model';

export class DetailTenantWarehouseRepository
  extends TimestampRepositoryMixin<
    DetailTenantWarehouseModel,
    typeof DetailTenantWarehouseModel.prototype.id,
    Constructor<
      DefaultCrudRepository<
        DetailTenantWarehouseModel,
        typeof DetailTenantWarehouseModel.prototype.id
      >
    >
  >(DefaultCrudRepository)
  implements IDetailTenantWarehouseRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(DetailTenantWarehouseModel, dataSource);
  }
}
