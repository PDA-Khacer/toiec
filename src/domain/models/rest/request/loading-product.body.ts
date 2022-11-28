import {RequestReceipt} from '../../invoice/request-receipt.model';
import {RejectRequest} from '../../invoice/reject-request.model';
import {DetailLoadingProduct} from '../../invoice/detail-loading-product.model';
import {ApproveRequest} from '../../invoice/approve-request.model';

export interface FormLoadingProductBody {
  idRequest: string;
  products: Array<FormLoadingOneProductBody>;
}

export interface FormLoadingOneProductBody {
  img?: string;
  note?: string;
  idZone: string;
  quantity: string;
  idProduct: string;
  idRequest: string;
  idTenant?: string;
  idWarehouse?: string;
  startAt: Date;
  doneAt: Date;
}

export interface HistoryDetailRequestReceipt {
  basic: RequestReceipt;
  reject: RejectRequest | null;
  approve: ApproveRequest | null;
  loading: DetailLoadingProduct[];
}
