import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  CustomRoleRepository,
} from '../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {CustomRole} from '../../../domain/models/custom-role.model';
import {Account} from '../../../domain/models/account.model';
import {CustomRoleFactory} from '../../../domain/services/custom-role-factory.service';

@bind()
export class CustomRoleService {
  constructor(
    @repository(CustomRoleRepository)
    private customRoleRepository: CustomRoleRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(CustomRoleFactory)
    private customRoleFactory: CustomRoleFactory,
  ) {}

  public async createCustomRole(
    idSelf: number,
    values: Omit<CustomRole, 'id'>,
  ): Promise<boolean> {
    try {
      // check
      const self = await this.getSelf(idSelf);
      // create

      const location = await this.customRoleFactory.buildCustomRole(values);

      location.whoCreate = self.id.toString();
      await this.customRoleRepository.create(location);
      return true;
    } catch (e) {
      console.log(
        '[ERR] src/infrastructure/services/partner.service.ts:20',
        e.toString(),
      );
      return false;
    }
  }

  public async getById(
    idSelf: number,
    idCustomRole: number,
  ): Promise<CustomRole | null> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockCustomRole(idSelf, idCustomRole))) {
      return this.customRoleRepository.findById(idCustomRole).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCustomRole');
      });
    }
    return null;
  }

  public async get(
    idSelf: number,
    filter?: Filter<CustomRole>,
  ): Promise<Array<CustomRole>> {
    // check
    await this.getSelf(idSelf);
    return this.customRoleRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<CustomRole>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.customRoleRepository.count(where);
  }

  public async updateCustomRole(
    idSelf: number,
    idCustomRole: number,
    value: CustomRole,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCustomRole(idSelf, idCustomRole, true)) {
      await this.customRoleRepository
        .updateById(idCustomRole, value)
        .finally(async () => {
          // unlock partner
          await this.lockCustomRole(idSelf, idCustomRole, false);
        });
      return true;
    }
    return false;
  }

  public async delete(idSelf: number, idCustomRole: number): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCustomRole(idSelf, idCustomRole, true)) {
      await this.customRoleRepository.deleteById(idCustomRole).catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundRole');
      });
      return true;
    }
    return false;
  }

  public async checkLockCustomRole(
    idSelf: number,
    idCustomRole: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const partner = await this.customRoleRepository
      .findById(idCustomRole)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCustomRole');
      });
    return partner.isLocked;
  }

  private async lockCustomRole(
    idSelf: number,
    idCustomRole: number,
    beLock: boolean,
  ): Promise<boolean> {
    const role = await this.customRoleRepository
      .findById(idCustomRole)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCustomRole');
      });

    if (beLock) {
      if (role.isLocked) {
        throw new HttpErrors.BadRequest('mgsCustomRoleLocked');
      } else {
        role.isLocked = true;
        role.whoLocked = String(idSelf);
        role.lockedAt = new Date();
      }
    } else {
      if (!role.isLocked) {
        throw new HttpErrors.BadRequest('mgsCustomRoleUnLocked');
      } else {
        role.isLocked = false;
      }
    }
    await this.customRoleRepository.updateById(idCustomRole, role);
    return true;
  }

  private async getSelf(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {id: id, isDeleted: false},
    });
    if (!account) {
      throw new HttpErrors.NotFound('msgNotFoundAccount');
    }

    if (account.expDate <= new Date()) {
      throw new HttpErrors.BadRequest('msgAccountExpDate');
    }

    if (account.isCustomRole) {
      // check role
    }

    return account;
  }
}
