import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {BillPayment} from '../../models/tenant/bill-payment';
import {BillPaymentRepository} from '../../repositories/tenant/bill-payment.repository';

@bind()
export class BillPaymentFactory {
  constructor(
    @repository('BillPaymentRepository')
    private billPaymentRepository: BillPaymentRepository,
  ) {}

  public async buildBillPaymentRepository(
    values: Pick<
      BillPayment,
      | 'code'
      | 'note'
      | 'status'
      | 'prices'
      | 'paymentMethod'
      | 'nameCredit'
      | 'numberCredit'
      | 'expirationDateCredit'
      | 'codeCredit'
      | 'addressWallet'
      | 'chain'
      | 'coin'
    >,
  ): Promise<BillPayment> {
    return new BillPayment({
      ...values,
    });
  }
}
