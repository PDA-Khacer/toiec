import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  DiscountPrices,
  DiscountPricesStatus,
} from '../../models/tenant/discount-prices.model';
import {DiscountPricesRepository} from '../../repositories/tenant/discount-prices.repository';

@bind()
export class DiscountPricesFactory {
  constructor(
    @repository('DiscountPricesRepository')
    private discountPricesRepository: DiscountPricesRepository,
  ) {}

  public async buildDiscountPrices(
    values: Pick<DiscountPrices, 'discount' | 'timeStart' | 'timeEnd'>,
  ): Promise<DiscountPrices> {
    return new DiscountPrices({
      ...values,
      status: DiscountPricesStatus.INACTIVE,
    });
  }
}
