import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {DetailLoadingProductRepository as IDetailLoadingProductRepository} from '../../../domain/repositories/invoice/detail-loading-product.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {DetailLoadingProduct} from '../../../domain/models/invoice/detail-loading-product.model';

export class DetailLoadingProductRepository
  extends TimestampRepositoryMixin<
    DetailLoadingProduct,
    typeof DetailLoadingProduct.prototype.id,
    Constructor<
      DefaultCrudRepository<
        DetailLoadingProduct,
        typeof DetailLoadingProduct.prototype.id
      >
    >
  >(DefaultCrudRepository)
  implements IDetailLoadingProductRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(DetailLoadingProduct, dataSource);
  }
}
