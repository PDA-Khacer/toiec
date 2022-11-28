import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {DetailReceiptRepository} from '../../repositories/invoice/detail-receipt.repository';
import {DetailRequestReceipt} from '../../models/invoice/detail-request-receipt.model';

@bind()
export class DetailRequestReceiptFactory {
  constructor(
    @repository('DetailReceiptRepository')
    private detailReceipt: DetailReceiptRepository,
  ) {}

  public async buildDetailRequestReceipt(
    values: Pick<DetailRequestReceipt, 'idReceipt'>,
  ): Promise<DetailRequestReceipt> {
    return new DetailRequestReceipt({
      ...values,
    });
  }
}
