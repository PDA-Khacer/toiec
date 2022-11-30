import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {SettingPricesRepository as ISettingPricesRepository} from '../../../domain/repositories/tenant/setting-prices.repository';
import {TimestampRepositoryMixin} from '../mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../../keys';
import {Question} from '../../../domain/models/toiec/question.model';

export class QuestionRepository
  extends TimestampRepositoryMixin<
    Question,
    typeof Question.prototype.id,
    Constructor<
      DefaultCrudRepository<Question, typeof Question.prototype.id>
    >
  >(DefaultCrudRepository)
  implements ISettingPricesRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(Question, dataSource);
  }
}
