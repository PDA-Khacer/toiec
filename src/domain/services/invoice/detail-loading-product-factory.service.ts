import {bind} from '@loopback/context';
import {DetailLoadingProduct} from '../../models/invoice/detail-loading-product.model';

@bind()
export class DetailLoadingProductFactory {
  constructor() {} // private productRepository: DetailLoadingProductRepository, // @repository('DetailLoadingProductRepository')

  public async buildDetailLoadingProduct(
    values: Pick<
      DetailLoadingProduct,
      | 'quantity'
      | 'idZone'
      | 'idProduct'
      | 'idTenant'
      | 'idWarehouse'
      | 'idRequest'
    >,
  ): Promise<DetailLoadingProduct> {
    return new DetailLoadingProduct({
      ...values,
    });
  }
}
