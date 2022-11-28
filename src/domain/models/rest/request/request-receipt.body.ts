export interface RequestReceiptBody {
  code: string;
  note: string;
  idTenant: string;
  idWarehouse: string;
  // products: Array<ProductRequest>;
  products: string;
  address?: string;
  whoCreate?: string;
}

export interface ProductRequest {
  idProduct: string;
  quantity: string;
}

export interface ApproveRequestBody {
  note?: string;
  tag?: string;
  expectedTime: Date;
  idRequest: string;
  isAutoArrange: boolean;
  whoCreate: string;
}

export interface RejectRequestBody {
  note?: string;
  reason?: string;
  idRequest: string;
}
