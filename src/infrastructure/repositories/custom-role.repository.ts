import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {CustomRoleRepository as ICustomRoleRepository} from '../../domain/repositories/custom-role.repository';
import {CustomRole} from '../../domain/models/custom-role.model';
import {TimestampRepositoryMixin} from './mixins/timestamp-mixin.repository';
import {DataSourceBindings} from '../../keys';

export class CustomRoleRepository
  extends TimestampRepositoryMixin<
    CustomRole,
    typeof CustomRole.prototype.id,
    Constructor<
      DefaultCrudRepository<CustomRole, typeof CustomRole.prototype.id>
    >
  >(DefaultCrudRepository)
  implements ICustomRoleRepository
{
  constructor(
    @inject(DataSourceBindings.DATASOURCE_DB)
    dataSource: juggler.DataSource,
  ) {
    super(CustomRole, dataSource);
  }
}
