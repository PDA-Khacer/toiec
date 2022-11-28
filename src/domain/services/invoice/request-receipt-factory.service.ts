import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {RequestReceiptRepository} from '../../../infrastructure/repositories';
import {
  RequestReceipt,
  RequestReceiptStatus,
  RequestReceiptType,
} from '../../models/invoice/request-receipt.model';

@bind()
export class RequestReceiptFactory {
  constructor(
    @repository('RequestReceiptRepository')
    private requestReceiptRepository: RequestReceiptRepository,
  ) {}

  public async buildExportRequestReceipt(
    values: Pick<RequestReceipt, 'code'>,
  ): Promise<RequestReceipt> {
    return this.buildRequestReceipt(
      new RequestReceipt({
        ...values,
        status: RequestReceiptStatus.WAITING,
        receiptType: RequestReceiptType.EXPORT,
      }),
    );
  }

  public async buildImportRequestReceipt(
    values: Pick<RequestReceipt, 'code'>,
  ): Promise<RequestReceipt> {
    return this.buildRequestReceipt(
      new RequestReceipt({
        ...values,
        status: RequestReceiptStatus.WAITING,
        receiptType: RequestReceiptType.IMPORT,
      }),
    );
  }

  public async buildInspectionRequestReceipt(
    values: Pick<RequestReceipt, 'code'>,
  ): Promise<RequestReceipt> {
    return this.buildRequestReceipt(
      new RequestReceipt({
        ...values,
        status: RequestReceiptStatus.WAITING,
        receiptType: RequestReceiptType.INSPECTION,
      }),
    );
  }

  public async buildRequestReceipt(
    values: Pick<RequestReceipt, 'code'>,
  ): Promise<RequestReceipt> {
    return new RequestReceipt({
      ...values,
    });
  }
}
