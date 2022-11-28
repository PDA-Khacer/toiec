import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {ProblemProductRepository as IProblemProductRepository} from '../../../domain/repositories/invoice/problem-product.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {ProblemProduct} from '../../../domain/models/invoice/problem-product.model';

export class ProblemProductRepository
  extends TimestampRepositoryMixin<
    ProblemProduct,
    typeof ProblemProduct.prototype.id,
    Constructor<
      DefaultCrudRepository<ProblemProduct, typeof ProblemProduct.prototype.id>
    >
  >(DefaultCrudRepository)
  implements IProblemProductRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(ProblemProduct, dataSource);
  }
}
