import {bind} from '@loopback/context';
import {ProblemProduct} from '../../models/invoice/problem-product.model';

@bind()
export class ProblemProductFactory {
  constructor() {} // private productRepository: ProblemProductRepository, // @repository('ProblemProductRepository')

  public async buildProblemProduct(
    values: Pick<
      ProblemProduct,
      | 'note'
      | 'code'
      | 'reason'
      | 'img'
      | 'idZone'
      | 'quantity'
      | 'idProduct'
      | 'idRequest'
      | 'idTenant'
      | 'idWarehouse'
    >,
  ): Promise<ProblemProduct> {
    return new ProblemProduct({
      ...values,
    });
  }
}
