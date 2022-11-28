import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  DetailLoadingProductRepository,
  DetailRequestReceiptRepository,
  PartnerRepository,
  ProductRepository,
  RequestReceiptRepository,
  WarehouseManagerRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {DetailLoadingProductFactory} from '../../../../domain/services/invoice/detail-loading-product-factory.service';
// import {FormLoadingProductBody} from '../../../../domain/models/rest/request/loading-product.body';
import {DetailLoadingProduct} from '../../../../domain/models/invoice/detail-loading-product.model';
import {FormLoadingProductBody} from '../../../../domain/models/rest/request/loading-product.body';
import {ProductSelection} from '../../../../domain/models/warehouse/product.model';
import {
  RequestReceiptStatus,
  RequestReceiptType,
} from '../../../../domain/models/invoice/request-receipt.model';

@bind()
export class DetailLoadingService {
  constructor(
    @repository(DetailLoadingProductRepository)
    private rejectRequestRepository: DetailLoadingProductRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(WarehouseManagerRepository)
    private warehouseManagerRepository: WarehouseManagerRepository,

    @repository(DetailLoadingProductRepository)
    private detailLoadingProductRepository: DetailLoadingProductRepository,

    @repository(RequestReceiptRepository)
    private requestReceiptRepository: RequestReceiptRepository,

    @repository(ProductRepository)
    private productRepository: ProductRepository,

    @repository(DetailRequestReceiptRepository)
    private detailRequestReceiptRepository: DetailRequestReceiptRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(DetailLoadingProductFactory)
    private detailLoadingProductFactory: DetailLoadingProductFactory,
  ) {}

  public async loadingProduct(
    idSelf: number,
    values: FormLoadingProductBody,
  ): Promise<Array<DetailLoadingProduct>> {
    const self = await this.getSelf(idSelf);

    const manager = await this.warehouseManagerRepository.findOne({
      where: {idAccount: idSelf.toString()},
    });

    if (!manager || !manager.idWarehouse) {
      throw new HttpErrors.NotFound('msgNotFoundWarehouseManager');
    }

    const loadingProducts = [] as Array<DetailLoadingProduct>;

    for (const value of values.products) {
      const product: Pick<
        DetailLoadingProduct,
        | 'note'
        | 'idRequest'
        | 'quantity'
        | 'idZone'
        | 'startAt'
        | 'doneAt'
        | 'idProduct'
        | 'idWarehouse'
        | 'idTenant'
      > = {
        note: value.note,
        idRequest: value.idRequest,
        quantity: value.quantity,
        idZone: value.idZone,
        startAt: value.startAt,
        doneAt: value.doneAt,
        idProduct: value.idProduct,
        idWarehouse: manager.id.toString(),
        idTenant: self.id.toString(),
      };

      const build =
        await this.detailLoadingProductFactory.buildDetailLoadingProduct(
          product,
        );
      build.whoCreate = idSelf.toString();
      loadingProducts.push(build);
    }

    const request = await this.requestReceiptRepository.findById(
      Number(values.idRequest),
    );

    const re = await this.detailLoadingProductRepository.createAll(
      loadingProducts,
    );

    // get quantity request
    const detailRequest = await this.detailRequestReceiptRepository.find({
      where: {idReceipt: values.idRequest},
    });

    // check loading old
    const old = await this.detailLoadingProductRepository.find({
      where: {idRequest: values.idRequest},
    });

    let updateStatus = true;

    detailRequest.forEach(value => {
      const quantity = old
        .filter(p => p.idProduct === value.idProduct)
        .reduce((partialSum, p) => partialSum + Number(p.quantity), 0);
      // console.log(
      //   `${value.idProduct} : quantity ${quantity} vs request Quantity ${value.quantity}`,
      // );
      if (quantity !== Number(value.quantity)) {
        updateStatus = false;
        return;
      }
    });

    if (updateStatus) {
      await this.requestReceiptRepository.updateById(request.id, {
        status: RequestReceiptStatus.SUCCESS,
      });
    }

    // update quantity product
    if (request.receiptType === RequestReceiptType.EXPORT) {
      for (const loadProduct of loadingProducts) {
        const product = await this.productRepository.findById(
          Number(loadProduct.idProduct),
        );
        const outComing =
          Number(product.outComingQuantity) - Number(loadProduct.quantity);
        const totalQuantity =
          Number(product.totalQuantity ? product.totalQuantity : 0) -
          Number(loadProduct.quantity);
        await this.productRepository.updateById(product.id, {
          outComingQuantity: outComing > 0 ? outComing.toString() : '0',
          totalQuantity: totalQuantity.toString(),
        });
      }
    } else if (request.receiptType === RequestReceiptType.IMPORT) {
      for (const loadProduct of loadingProducts) {
        const product = await this.productRepository.findById(
          Number(loadProduct.idProduct),
        );
        const totalQuantity =
          Number(product.totalQuantity ? product.totalQuantity : 0) +
          Number(loadProduct.quantity);
        const inComing =
          Number(product.inComingQuantity) - Number(loadProduct.quantity);
        await this.productRepository.updateById(product.id, {
          inComingQuantity: inComing > 0 ? inComing.toString() : '0',
          totalQuantity: totalQuantity.toString(),
        });
      }
    }
    return re;
  }

  public async get(
    idSelf: number,
    filter?: Filter<DetailLoadingProduct>,
  ): Promise<Array<DetailLoadingProduct>> {
    // check
    await this.getSelf(idSelf);
    return this.rejectRequestRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<DetailLoadingProduct>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.rejectRequestRepository.count(where);
  }

  private async checkRequire(
    value:
      | DetailLoadingProduct
      | {idWarehouse?: string; idTenant?: string; idRequest?: string},
  ): Promise<{
    result: boolean;
    values:
      | DetailLoadingProduct
      | {idWarehouse?: string; idTenant?: string; idRequest?: string};
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

  public async getLoadingProduct(
    idSelf: number,
    idReceipt: string,
    productionSelected: ProductSelection[],
  ): Promise<{[key: string]: DetailLoadingProduct[]}> {
    await this.getSelf(idSelf);
    const re = {} as {[key: string]: DetailLoadingProduct[]};
    // get product loading
    for (const product of productionSelected) {
      if (product.id)
        re[product.id] = await this.detailLoadingProductRepository.find({
          where: {idProduct: product.id, idRequest: idReceipt},
        });
    }
    return re;
  }
}
