import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  DetailReceipt,
  DetailReceiptType,
} from '../../models/invoice/detail-receipt.model';
import {DetailReceiptRepository} from '../../repositories/invoice/detail-receipt.repository';

@bind()
export class DetailReceiptFactory {
  constructor(
    @repository('DetailReceiptRepository')
    private detailReceipt: DetailReceiptRepository,
  ) {}

  public async buildDetailExportReceipt(
    values: Pick<DetailReceipt, 'code'>,
  ): Promise<DetailReceipt> {
    return this.buildDetailReceipt(
      new DetailReceipt({
        ...values,
        receiptType: DetailReceiptType.EXPORT,
      }),
    );
  }

  public async buildDetailImportReceipt(
    values: Pick<DetailReceipt, 'code'>,
  ): Promise<DetailReceipt> {
    return this.buildDetailReceipt(
      new DetailReceipt({
        ...values,
        receiptType: DetailReceiptType.IMPORT,
      }),
    );
  }

  public async buildDetailReceipt(
    values: Pick<DetailReceipt, 'code'>,
  ): Promise<DetailReceipt> {
    return new DetailReceipt({
      ...values,
    });
  }
}
