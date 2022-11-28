import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  Warehouse,
  WarehouseType,
  WarehouseStatus,
} from '../../models/warehouse/warehouse.model';
import {WarehouseRepository} from '../../repositories/warehouse/warehouse.repository';

@bind()
export class WarehouseFactory {
  constructor(
    @repository('WarehouseRepository')
    private warehouseRepository: WarehouseRepository,
  ) {}

  private static async buildWarehouse(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return new Warehouse({
      ...values,
      status: WarehouseStatus.INACTIVE,
    });
  }

  public async buildWarehouseDefault(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return WarehouseFactory.buildWarehouse(
      new Warehouse({
        ...values,
        warehouseType: WarehouseType.DEFAULT,
      }),
    );
  }

  public async buildWarehouseDistributionCenter(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return WarehouseFactory.buildWarehouse(
      new Warehouse({
        ...values,
        warehouseType: WarehouseType.DISTRIBUTION_CENTER,
      }),
    );
  }

  public async buildWarehouseSmartWarehouse(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return WarehouseFactory.buildWarehouse(
      new Warehouse({
        ...values,
        warehouseType: WarehouseType.SMART_WAREHOUSE,
      }),
    );
  }

  public async buildWarehouseColdStorage(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return WarehouseFactory.buildWarehouse(
      new Warehouse({
        ...values,
        warehouseType: WarehouseType.COLD_STORAGE,
      }),
    );
  }

  public async buildWarehouseBoundedWarehouse(
    values: Pick<Warehouse, 'code'>,
  ): Promise<Warehouse> {
    return WarehouseFactory.buildWarehouse(
      new Warehouse({
        ...values,
        warehouseType: WarehouseType.BONDED_WAREHOUSE,
      }),
    );
  }
}
