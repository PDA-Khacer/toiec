import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {Partner, PartnerType, PartnerStatus} from '../models/partner.model';
import {PartnerRepository} from '../repositories/partner.repository';

@bind()
export class PartnerFactory {
  constructor(
    @repository('PartnerRepository')
    private partnerRepository: PartnerRepository,
  ) {}

  private static async buildPartner(
    values: Pick<Partner, 'code'>,
  ): Promise<Partner> {
    return new Partner({
      ...values,
      status: PartnerStatus.INACTIVE,
      isLocked: false,
    });
  }

  public async buildPartnerSystem(
    values: Pick<Partner, 'code'>,
  ): Promise<Partner> {
    return PartnerFactory.buildPartner(
      new Partner({
        ...values,
        partnerType: PartnerType.SYSTEM,
      }),
    );
  }

  public async buildPartnerWarehouse(
    values: Pick<Partner, 'code'>,
  ): Promise<Partner> {
    return PartnerFactory.buildPartner(
      new Partner({
        ...values,
        partnerType: PartnerType.WAREHOUSE,
      }),
    );
  }

  public async buildPartnerBoth(
    values: Pick<Partner, 'code'>,
  ): Promise<Partner> {
    return PartnerFactory.buildPartner(
      new Partner({
        ...values,
        partnerType: PartnerType.BOTH,
      }),
    );
  }

  public async buildPartnerTenant(
    values: Pick<Partner, 'code'>,
  ): Promise<Partner> {
    return PartnerFactory.buildPartner(
      new Partner({
        ...values,
        partnerType: PartnerType.TENANT,
      }),
    );
  }
}
