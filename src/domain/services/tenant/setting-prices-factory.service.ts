import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {SettingPrices} from '../../models/tenant/setting-prices.model';
import {SettingPricesRepository} from '../../repositories/tenant/setting-prices.repository';

@bind()
export class SettingPricesFactory {
  constructor(
    @repository('SettingPricesRepository')
    private settingPricesRepository: SettingPricesRepository,
  ) {}

  public async buildSettingPrices(
    values: Pick<
      SettingPrices,
      | 'prices'
      | 'autoAccept'
      | 'nameCredit'
      | 'numberCredit'
      | 'expirationDateCredit'
      | 'codeCredit'
      | 'addressWallet'
      | 'chain'
      | 'coin'
    >,
  ): Promise<SettingPrices> {
    return new SettingPrices({
      ...values,
      isLocked: false,
    });
  }
}
