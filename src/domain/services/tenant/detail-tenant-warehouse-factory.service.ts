import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  DetailTenantWarehouseModel,
  DetailTenantWarehouseStatus,
} from '../../models/tenant/detail-tenant-warehouse.model';
import {DetailTenantWarehouseRepository} from '../../repositories/tenant/detail-tenant-warehouse.repository';

@bind()
export class DetailTenantWarehouseFactory {
  constructor(
    @repository('DetailTenantWarehouseRepository')
    private detailTenantWarehouseRepository: DetailTenantWarehouseRepository,
  ) {}

  public async buildDetailTenantWarehouse(
    values: Pick<
      DetailTenantWarehouseModel,
      'idWarehouse' | 'numberSKU' | 'startDate' | 'expDate' | 'code'
    >,
  ): Promise<DetailTenantWarehouseModel> {
    return new DetailTenantWarehouseModel({
      ...values,
      status: DetailTenantWarehouseStatus.WAITING,
    });
  }
}
