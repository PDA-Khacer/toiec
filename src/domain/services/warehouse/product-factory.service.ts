import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {Product, ProductStatus} from '../../models/warehouse/product.model';
import {ProductRepository} from '../../repositories/warehouse/product.repository';

@bind()
export class ProductFactory {
  constructor(
    @repository('ProductRepository')
    private productRepository: ProductRepository,
  ) {}

  public async buildProduct(
    values: Pick<
      Product,
      | 'code'
      | 'barcode'
      | 'imageProduct'
      | 'fullName'
      | 'shortName'
      | 'idCategory'
      | 'idCommodityUnit'
      | 'totalQuantity'
      | 'inComingQuantity'
      | 'outComingQuantity'
      | 'idPartner'
      | 'idWarehouse'
    >,
  ): Promise<Product> {
    return new Product({
      ...values,
      status: ProductStatus.ACTIVE,
    });
  }
}
