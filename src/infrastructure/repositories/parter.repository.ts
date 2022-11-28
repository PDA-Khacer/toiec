import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {PartnerRepository as IPartnerRepository} from '../../domain/repositories/partner.repository';
import {Partner} from '../../domain/models/partner.model';
import {TimestampRepositoryMixin} from './mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../keys';

export class PartnerRepository
  extends TimestampRepositoryMixin<
    Partner,
    typeof Partner.prototype.id,
    Constructor<DefaultCrudRepository<Partner, typeof Partner.prototype.id>>
  >(DefaultCrudRepository)
  implements IPartnerRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(Partner, dataSource);
  }
}
