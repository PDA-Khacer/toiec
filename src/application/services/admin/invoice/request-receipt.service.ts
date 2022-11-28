import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  PartnerRepository,
  RequestReceiptRepository,
  WarehouseRepository,
  DetailRequestReceiptRepository,
  DetailLoadingProductRepository,
  RejectRequestRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {
  RequestReceipt,
  RequestReceiptStatus,
  RequestReceiptType,
} from '../../../../domain/models/invoice/request-receipt.model';
import {RequestReceiptFactory} from '../../../../domain/services/invoice/request-receipt-factory.service';
import {
  ProductRequest,
  RequestReceiptBody,
} from '../../../../domain/models/rest/request/request-receipt.body';
import {ProductSelection} from '../../../../domain/models/warehouse/product.model';
import {ProductService} from '../warehouse/product.service';

@bind()
export class RequestReceiptService {
  constructor(
    @repository(RequestReceiptRepository)
    private requestReceiptRepository: RequestReceiptRepository,

    @repository(DetailRequestReceiptRepository)
    private detailRequestReceiptRepository: DetailRequestReceiptRepository,

    @repository(DetailLoadingProductRepository)
    private detailLoadingProductRepository: DetailLoadingProductRepository,

    @repository(RejectRequestRepository)
    private rejectRequestRepository: RejectRequestRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(RequestReceiptFactory)
    private requestReceiptFactory: RequestReceiptFactory,

    @service(ProductService)
    private productService: ProductService,
  ) {}

  public async createRequestReceipt(
    idSelf: number,
    values: Omit<RequestReceipt, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let requestReceipt;
    if (values.receiptType === RequestReceiptType.IMPORT) {
      requestReceipt =
        await this.requestReceiptFactory.buildImportRequestReceipt(values);
    } else if (values.receiptType === RequestReceiptType.EXPORT) {
      requestReceipt =
        await this.requestReceiptFactory.buildExportRequestReceipt(values);
    } else {
      requestReceipt =
        await this.requestReceiptFactory.buildInspectionRequestReceipt(values);
    }

    await this.checkRequire(requestReceipt);

    requestReceipt.whoCreate = self.id.toString();
    await this.requestReceiptRepository.create(requestReceipt);
    return true;
  }

  public async requestImport(idSelf: number, value: RequestReceiptBody) {
    const self = await this.getSelf(idSelf);

    await this.checkRequire({
      idWarehouse: value.idWarehouse,
      idTenant: value.idTenant,
    });

    const receipt = await this.requestReceiptRepository.create({
      idWarehouse: value.idWarehouse,
      code: value.code,
      idTenant: value.idTenant,
      receiptType: RequestReceiptType.IMPORT,
      note: value.note,
      status: RequestReceiptStatus.WAITING,
      whoCreate: self.id.toString(),
    });
    const products = JSON.parse(value.products) as Array<ProductRequest>;
    //
    for (const product of products) {
      await this.detailRequestReceiptRepository.create({
        idReceipt: receipt.id.toString(),
        whoCreate: self.id.toString(),
        idProduct: product.idProduct,
        quantity: product.quantity,
      });
    }
  }

  public async requestExport(idSelf: number, value: RequestReceiptBody) {
    const self = await this.getSelf(idSelf);

    await this.checkRequire({
      idWarehouse: value.idWarehouse,
      idTenant: value.idTenant,
    });

    const receipt = await this.requestReceiptRepository.create({
      idWarehouse: value.idWarehouse,
      code: value.code,
      idTenant: value.idTenant,
      receiptType: RequestReceiptType.EXPORT,
      note: value.note,
      status: RequestReceiptStatus.WAITING,
      whoCreate: self.id.toString(),
      address: value.address,
    });
    const products = JSON.parse(value.products) as Array<ProductRequest>;
    //
    for (const product of products) {
      await this.detailRequestReceiptRepository.create({
        idReceipt: receipt.id.toString(),
        whoCreate: self.id.toString(),
        idProduct: product.idProduct,
        quantity: product.quantity,
      });
    }
  }

  public async requestInspection(idSelf: number, value: RequestReceiptBody) {
    const self = await this.getSelf(idSelf);

    await this.checkRequire({
      idWarehouse: value.idWarehouse,
      idTenant: value.idTenant,
    });

    const receipt = await this.requestReceiptRepository.create({
      idWarehouse: value.idWarehouse,
      code: value.code,
      idTenant: value.idTenant,
      receiptType: RequestReceiptType.INSPECTION,
      note: value.note,
      status: RequestReceiptStatus.WAITING,
      whoCreate: self.id.toString(),
    });
    const products = JSON.parse(value.products) as Array<ProductRequest>;
    //
    for (const product of products) {
      await this.detailRequestReceiptRepository.create({
        idReceipt: receipt.id.toString(),
        whoCreate: self.id.toString(),
        idProduct: product.idProduct,
        quantity: '0',
      });
    }
  }

  public async requestShipCod(idSelf: number, value: RequestReceiptBody) {
    const self = await this.getSelf(idSelf);

    await this.checkRequire({
      idWarehouse: value.idWarehouse,
      idTenant: value.idTenant,
    });

    const receipt = await this.requestReceiptRepository.create({
      idWarehouse: value.idWarehouse,
      code: value.code,
      idTenant: value.idTenant,
      receiptType: RequestReceiptType.SHIP_COD,
      note: value.note,
      status: RequestReceiptStatus.WAITING,
      whoCreate: self.id.toString(),
    });
    const products = JSON.parse(value.products) as Array<ProductRequest>;
    //
    for (const product of products) {
      await this.detailRequestReceiptRepository.create({
        idReceipt: receipt.id.toString(),
        whoCreate: self.id.toString(),
        idProduct: product.idProduct,
        quantity: '0',
      });
    }
  }

  public async updateProductApprove(idSelf: number, idReceipt: number) {
    const request = await this.requestReceiptRepository
      .findById(idReceipt)
      .catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundRequestReceipt');
      });
    const productSelections = await this.getProductById(idSelf, idReceipt);
    for (const p of productSelections) {
      await this.productService.addComingProduct(
        idSelf,
        Number(p.id),
        Number(p.quantity),
        request.receiptType,
      );
    }
  }

  public async getById(
    idSelf: number,
    idRequestReceipt: number,
  ): Promise<RequestReceipt> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockRequestReceipt(idSelf, idRequestReceipt))) {
      return this.requestReceiptRepository
        .findById(idRequestReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundRequestReceipt');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async getProductById(
    idSelf: number,
    idRequestReceipt: number,
  ): Promise<Array<ProductSelection>> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockRequestReceipt(idSelf, idRequestReceipt))) {
      const command = `
      SELECT a3.id, a2.quantity, a3."fullName", a3."idCategory", a3."idCommodityUnit", a3.code, a3."imageProduct", a3."totalQuantity", a3.barcode
      FROM 
      (SELECT * FROM public."detail-request-receipt" a1 where a1."idReceipt" = '${idRequestReceipt}' ) a2 
      inner join 
      public.product a3 
      on a2."idProduct" = a3.id::text `;
      const product = await this.accountRepository.execute(command);
      return product as Array<ProductSelection>;
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<RequestReceipt>,
  ): Promise<Array<RequestReceipt>> {
    // check
    await this.getSelf(idSelf);
    return this.requestReceiptRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<RequestReceipt>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.requestReceiptRepository.count(where);
  }

  public async updateRequestReceipt(
    idSelf: number,
    idRequestReceipt: number,
    value: RequestReceipt,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockRequestReceipt(idSelf, idRequestReceipt, true)) {
      await this.requestReceiptRepository
        .updateById(idRequestReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockRequestReceipt(idSelf, idRequestReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusRequestReceipt(
    idSelf: number,
    idRequestReceipt: number,
    status: RequestReceiptStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockRequestReceipt(idSelf, idRequestReceipt, true)) {
      const value = await this.requestReceiptRepository
        .findById(idRequestReceipt)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundRequestReceipt');
        });
      value.status = status;
      await this.requestReceiptRepository
        .updateById(idRequestReceipt, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockRequestReceipt(idSelf, idRequestReceipt, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockRequestReceipt(
    idSelf: number,
    idRequestReceipt: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.requestReceiptRepository
      .findById(idRequestReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundRequestReceipt');
      });
    return warehouse.isLocked;
  }

  public async delete(idSelf: number, id: number): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockRequestReceipt(idSelf, id, true)) {
      await this.requestReceiptRepository.deleteById(id).catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundRequestReceipt');
      });
      await this.detailRequestReceiptRepository.deleteAll({
        idReceipt: id.toString(),
      });
      await this.detailLoadingProductRepository.deleteAll({
        idRequest: id.toString(),
      });
      await this.rejectRequestRepository.deleteAll({
        idRequest: id.toString(),
      });
      return true;
    }
    return false;
  }

  private async lockRequestReceipt(
    idSelf: number,
    idRequestReceipt: number,
    beLock: boolean,
  ): Promise<boolean> {
    const receipt = await this.requestReceiptRepository
      .findById(idRequestReceipt)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundRequestReceipt');
      });

    if (receipt.isLocked) {
      throw new HttpErrors.BadRequest('mgsRequestReceiptLocked');
    } else {
      if (beLock) {
        receipt.isLocked = true;
        receipt.whoLocked = String(idSelf);
        receipt.lockedAt = new Date();
      } else {
        receipt.isLocked = false;
      }
      await this.requestReceiptRepository.updateById(idRequestReceipt, receipt);
      return true;
    }
  }

  private async checkRequire(
    value: RequestReceipt | {idWarehouse: string; idTenant: string},
  ): Promise<{
    result: boolean;
    values: RequestReceipt | {idWarehouse: string; idTenant: string};
  }> {
    await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });

    await this.partnerRepository
      .findById(Number(value.idTenant))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundTenant');
      });

    return {result: true, values: value};
  }

  private async getSelf(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {id: id, isDeleted: false},
    });
    if (!account) {
      throw new HttpErrors.NotFound('msgNotFoundAccount');
    }

    if (account.expDate <= new Date()) {
      throw new HttpErrors.BadRequest('msgAccountExpDate');
    }

    if (account.isCustomRole) {
      // check role
    }

    return account;
  }
}
