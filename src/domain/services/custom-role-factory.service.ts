import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {CustomRole} from '../models/custom-role.model';
import {CustomRoleRepository} from '../repositories/custom-role.repository';

@bind()
export class CustomRoleFactory {
  constructor(
    @repository('CustomRoleRepository')
    private customRoleRepository: CustomRoleRepository,
  ) {}

  public async buildCustomRole(
    values: Pick<CustomRole, 'idAccount'>,
  ): Promise<CustomRole> {
    return new CustomRole({
      ...values,
      isActive: 'active',
    });
  }
}
