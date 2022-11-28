import {DetailLoadingProduct} from '../../invoice/detail-loading-product.model';
import {ProblemProduct} from '../../invoice/problem-product.model';
import {InspectionStatus} from '../../invoice/detail-request-receipt.model';

export interface HistoryProductBody {
  time: Date;
  data: DataHistory;
}

export interface DataHistory {
  loading: DetailLoadingProduct[];
  problem: ProblemProduct[];
  request: DetailRequestReceiptHistory[];
}

export interface DetailRequestReceiptHistory {
  id?: number;
  idReceipt?: string; // idRequest
  note?: string;
  whoInspection?: string;
  idProduct?: string;
  inspectionStatus?: InspectionStatus;
  quantity?: string;
  shortName?: string;
  fullName?: string;
  imageProduct?: string;
  idCommodityUnit?: string;
  idCategory?: string;
  whoCreate?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lockedAt?: Date;
  isLocked?: boolean;
  whoLocked?: string;
  receiptType?: string;
}
