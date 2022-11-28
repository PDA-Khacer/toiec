import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {WarehouseManager} from '../../models/warehouse/warehouse-manager.model';
import {WarehouseManagerRepository} from '../../repositories/warehouse/warehouse-manager.repository';

@bind()
export class WarehouseManagerFactory {
  constructor(
    @repository('WarehouseManagerRepository')
    private productZoneRepository: WarehouseManagerRepository,
  ) {}

  public async buildWarehouseManager(
    values: Pick<WarehouseManager, 'idAccount'>,
  ): Promise<WarehouseManager> {
    return new WarehouseManager({
      ...values,
    });
  }
}
