import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  Receipt,
  ReceiptStatus,
  ReceiptType,
} from '../../models/invoice/receipt.model';
import {ReceiptRepository} from '../../repositories/invoice/receipt.repository';

@bind()
export class ReceiptFactory {
  constructor(
    @repository('ReceiptRepository')
    private receiptRepository: ReceiptRepository,
  ) {}

  public async buildExportReceipt(
    values: Pick<Receipt, 'code'>,
  ): Promise<Receipt> {
    return this.buildReceipt(
      new Receipt({
        ...values,
        status: ReceiptStatus.DRAFT,
        receiptType: ReceiptType.EXPORT,
      }),
    );
  }

  public async buildImportReceipt(
    values: Pick<Receipt, 'code'>,
  ): Promise<Receipt> {
    return this.buildReceipt(
      new Receipt({
        ...values,
        status: ReceiptStatus.DRAFT,
        receiptType: ReceiptType.IMPORT,
      }),
    );
  }

  public async buildReceipt(values: Pick<Receipt, 'code'>): Promise<Receipt> {
    return new Receipt({
      ...values,
    });
  }
}
