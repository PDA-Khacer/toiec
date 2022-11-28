import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  ProductZone,
  ProductZoneStatus,
} from '../../models/warehouse/product-zone.model';
import {ProductZoneRepository} from '../../repositories/warehouse/product-zone.repository';

@bind()
export class ProductZoneFactory {
  constructor(
    @repository('ProductZoneRepository')
    private productZoneRepository: ProductZoneRepository,
  ) {}

  public async buildProductZone(
    values: Pick<ProductZone, 'lotNumber'>,
  ): Promise<ProductZone> {
    return new ProductZone({
      ...values,
      status: ProductZoneStatus.ACTIVE,
    });
  }
}
