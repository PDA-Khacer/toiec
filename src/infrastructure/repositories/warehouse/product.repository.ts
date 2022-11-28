import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {ProductRepository as IProductRepository} from '../../../domain/repositories/warehouse/product.repository';
import {Product} from '../../../domain/models/warehouse/product.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';

export class ProductRepository
  extends TimestampRepositoryMixin<
    Product,
    typeof Product.prototype.id,
    Constructor<DefaultCrudRepository<Product, typeof Product.prototype.id>>
  >(DefaultCrudRepository)
  implements IProductRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(Product, dataSource);
  }

  public async getProductByOtherId(
    idZone: number,
    idWarehouse: number,
    idPartner: number,
    idCategory: number, // TODO: missing need do
  ): Promise<Array<Product>> {
    if (idWarehouse !== 0) {
      if (idZone === 0) {
        return this.find({
          where: {
            idWarehouse: String(idWarehouse),
            idPartner: String(idPartner),
          },
        });
      } else {
        return this.dataSource.execute(`select 
            p.* 
        from product p 
          inner join 
            (select 
                a.* 
            from "product-zone" a ) aa 
          on p.id = aa."idProduct"::integer 
          inner join 
            (select 
                * 
            from "warehouse-zone" b 
            where b."idWarehouse"::integer=${idWarehouse} and b.id=${idZone}) c 
          on aa."idZone"::integer = c.id 
        where p."idPartner"::integer = ${idPartner}`);
      }
    } else if (idZone !== 0) {
      return this.dataSource.execute(`select p.* from product p
        inner join 
        (select 
            a.*
        from "product-zone" a 
        where a."idZone"::integer=${idZone}) aa
        on p.id = aa."idProduct"::integer 
        where p."idPartner"::integer=${idPartner}`);
    }
    return [];
  }
}
