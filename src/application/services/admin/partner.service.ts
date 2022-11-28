import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
} from '../../../infrastructure/repositories';
import {
  Partner,
  PartnerStatus,
  PartnerType,
} from '../../../domain/models/partner.model';
import {PartnerFactory} from '../../../domain/services/partner-factory.server';
import {service} from '@loopback/core';
import {Account, Role} from '../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {AccountAdminService} from './account.service';
import {WarehouseManagerService} from './warehouse/warehouse-manager.service';

@bind()
export class PartnerService {
  constructor(
    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(PartnerFactory)
    private partnerFactory: PartnerFactory,

    @service(AccountAdminService)
    private accountAdminService: AccountAdminService,

    @service(WarehouseManagerService)
    private warehouseManagerService: WarehouseManagerService,
  ) {}

  public async createPartner(
    idSelf: number,
    values: Omit<Partner, 'id'>,
  ): Promise<boolean> {
    try {
      // check
      const self = await this.getSelf(idSelf);
      // create
      let partner: Partner;
      switch (values.partnerType) {
        case PartnerType.SYSTEM:
          partner = await this.partnerFactory.buildPartnerSystem(values);
          break;
        case PartnerType.TENANT:
          partner = await this.partnerFactory.buildPartnerTenant(values);
          break;
        case PartnerType.WAREHOUSE:
          partner = await this.partnerFactory.buildPartnerWarehouse(values);
          break;
        case PartnerType.BOTH:
          partner = await this.partnerFactory.buildPartnerBoth(values);
          break;
      }
      partner.whoCreate = self.id.toString();
      const partnerCreated = await this.partnerRepository.create(partner);

      //
      await this.accountAdminService.initAccountPartner(
        partner.partnerType,
        partner.email,
        partnerCreated.id.toString(),
        idSelf.toString(),
        self.expDate,
      );

      if (partner.partnerType === PartnerType.TENANT) {
        const tenantManager = await this.accountAdminService.initAccountTenant(
          partner.email,
          partnerCreated.id.toString(),
          idSelf.toString(),
          self.expDate,
        );

        await this.warehouseManagerService.initTenant(
          idSelf,
          tenantManager.id.toString(),
          partnerCreated.id.toString(),
          partnerCreated.id.toString(),
        );
      }

      return true;
    } catch (e) {
      console.log(
        '[ERR] src/infrastructure/services/partner.service.ts:20',
        e.toString(),
      );
      throw new HttpErrors.BadRequest('msgCodeExited');
    }
  }

  public async getById(idSelf: number, idPartner: number): Promise<Partner> {
    // check
    await this.getSelf(idSelf);

    if (!(await this.checkLockPartner(idSelf, idPartner))) {
      return this.partnerRepository.findById(idPartner).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('msgNotFoundPartner');
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async getBySelf(idSelf: number): Promise<Partner> {
    // check
    const self = await this.getSelf(idSelf);

    if (!(await this.checkLockPartner(idSelf, Number(self.idPartner)))) {
      return this.partnerRepository
        .findById(Number(self.idPartner))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundPartner');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<Partner>,
  ): Promise<Array<Partner>> {
    // check
    await this.getSelf(idSelf);
    return this.partnerRepository.find(filter);
  }

  public async count(idSelf: number, where?: Where<Partner>): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.partnerRepository.count(where);
  }

  public async updatePartner(
    idSelf: number,
    idPartner: number,
    value: Partner,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockPartner(idSelf, idPartner, true)) {
      await this.partnerRepository
        .updateById(idPartner, value)
        .finally(async () => {
          // unlock partner
          await this.lockPartner(idSelf, idPartner, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusPartner(
    idSelf: number,
    idPartner: number,
    status: PartnerStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockPartner(idSelf, idPartner, true)) {
      const value = await this.partnerRepository
        .findById(idPartner)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundPartner');
        });
      value.status = status;
      await this.partnerRepository
        .updateById(idPartner, value)
        .finally(async () => {
          // unlock partner
          await this.lockPartner(idSelf, idPartner, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockPartner(
    idSelf: number,
    idPartner: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const partner = await this.partnerRepository
      .findById(idPartner)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundPartner');
      });
    return partner.isLocked;
  }

  private async lockPartner(
    idSelf: number,
    idPartner: number,
    beLock: boolean,
  ): Promise<boolean> {
    const partner = await this.partnerRepository
      .findById(idPartner)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundPartner');
      });

    if (partner.isLocked && beLock) {
      throw new HttpErrors.BadRequest('mgsPartnerLocked');
    } else {
      if (beLock) {
        partner.isLocked = true;
        partner.whoLocked = String(idSelf);
        partner.lockedAt = new Date();
      } else {
        partner.isLocked = false;
      }
      await this.partnerRepository.updateById(idPartner, partner);
      return true;
    }
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

    if (
      !account.isCustomRole &&
      account.role !== Role.ADMIN &&
      account.role !== Role.ROOT_ADMIN &&
      account.role !== Role.TENANT_WAREHOUSE
    ) {
      throw new HttpErrors.Unauthorized('msgNotPermission');
    }

    if (account.isCustomRole) {
      // check role
    }

    return account;
  }

  public async initSystem(idSuperAdmin: number): Promise<void> {
    await this.partnerRepository.create({
      code: 'partner_root_warehouse',
      name: 'root_warehouse',
      email: 'root_warehosue@gmail.com',
      tag: '',
      note: '',
      partnerType: PartnerType.WAREHOUSE,
      whoCreate: idSuperAdmin.toString(),
      status: PartnerStatus.ACTIVE,
    });

    await this.partnerRepository.create({
      code: 'partner_root_tenant',
      name: 'root_tenant',
      email: 'root_tenant@gmail.com',
      tag: '',
      note: '',
      partnerType: PartnerType.TENANT,
      whoCreate: idSuperAdmin.toString(),
      status: PartnerStatus.ACTIVE,
    });
  }
}
