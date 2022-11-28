import {Product} from '../../models/warehouse/product.model';

export interface ProductRepository {
  getProductByOtherId(
    idZone: number,
    idWarehouse: number,
    idPartner: number,
    idCategory: number,
  ): Promise<Array<Product>>;
}
