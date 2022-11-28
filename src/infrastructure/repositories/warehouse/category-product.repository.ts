import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {CategoryProductRepository as ICategoryProductRepository} from '../../../domain/repositories/warehouse/category-product.repository';
import {CategoryProduct} from '../../../domain/models/warehouse/category-product.model';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {HttpErrors} from '@loopback/rest';

export class CategoryProductRepository
  extends TimestampRepositoryMixin<
    CategoryProduct,
    typeof CategoryProduct.prototype.id,
    Constructor<
      DefaultCrudRepository<
        CategoryProduct,
        typeof CategoryProduct.prototype.id
      >
    >
  >(DefaultCrudRepository)
  implements ICategoryProductRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(CategoryProduct, dataSource);
  }

  public async canCreateSubCate(idFather: number): Promise<boolean> {
    let father: CategoryProduct;
    let lvl = 0;
    do {
      father = await this.findById(idFather).catch(reason => {
        console.log(reason.toString());
        throw new HttpErrors.NotFound('msgNotFoundFather');
      });
      idFather = Number(father.idCateFather);
      lvl++;
    } while (
      father.idCateFather !== '0' &&
      lvl < Number(process.env.NUMBER_LVL_CATE)
    );
    return Promise.resolve(lvl < Number(process.env.NUMBER_LVL_CATE));
  }
}
