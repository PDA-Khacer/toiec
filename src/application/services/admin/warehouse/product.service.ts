import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind, inject} from '@loopback/context';
import {
  AccountRepository,
  CommodityUnitRepository,
  DetailLoadingProductRepository,
  DetailRequestReceiptRepository,
  PartnerRepository,
  ProblemProductRepository,
  ProductRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors, Request, Response} from '@loopback/rest';
import {ProductFactory} from '../../../../domain/services/warehouse/product-factory.service';
import {
  Product,
  ProductSelection,
  ProductStatus,
} from '../../../../domain/models/warehouse/product.model';
import {RequestReceiptType} from '../../../../domain/models/invoice/request-receipt.model';
import {
  DetailRequestReceiptHistory,
  HistoryProductBody,
} from '../../../../domain/models/rest/request/history-product.body';
import {FileHandler} from '../../../utils/file-handler';
import {S3AWSService} from '../../../../infrastructure/services/s3-aws.service';
import {FILE_UPLOAD_SERVICE, FileUploadHandler} from '../../../../keys';

@bind()
export class ProductService {
  private fileHandler: FileHandler;
  private productFolder: string;
  constructor(
    @repository(ProductRepository)
    private productRepository: ProductRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(CommodityUnitRepository)
    private commodityUnitRepository: CommodityUnitRepository,

    @repository(DetailLoadingProductRepository)
    private detailLoadingProductRepository: DetailLoadingProductRepository,

    @repository(ProblemProductRepository)
    private problemProductRepository: ProblemProductRepository,

    @repository(DetailRequestReceiptRepository)
    private detailRequestReceiptRepository: DetailRequestReceiptRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(ProductFactory)
    private productFactory: ProductFactory,

    @service(S3AWSService)
    private s3AWSService: S3AWSService,

    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) {
    this.fileHandler = new FileHandler(this.handler);
    this.productFolder = 'image_product';
  }

  public async createProduct(
    idSelf: number,
    values: Omit<Product, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    const product = await this.productFactory.buildProduct(values);

    await this.checkRequire(product);

    product.whoCreate = self.id.toString();
    await this.productRepository.create(product);
    return true;
  }

  public async getById(idSelf: number, idProduct: number): Promise<Product> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockProduct(idSelf, idProduct))) {
      return this.productRepository.findById(idProduct).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProduct');
      });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<Product>,
  ): Promise<Array<Product>> {
    // check
    await this.getSelf(idSelf);
    return this.productRepository.find(filter);
  }

  public async count(idSelf: number, where?: Where<Product>): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.productRepository.count(where);
  }

  public async updateProduct(
    idSelf: number,
    idWarehouse: number,
    value: Product,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockProduct(idSelf, idWarehouse, true)) {
      await this.productRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockProduct(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusProduct(
    idSelf: number,
    idWarehouse: number,
    status: ProductStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockProduct(idSelf, idWarehouse, true)) {
      const value = await this.productRepository
        .findById(idWarehouse)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundProduct');
        });
      value.status = status;
      await this.productRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockProduct(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockProduct(
    idSelf: number,
    idProduct: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouse = await this.productRepository
      .findById(idProduct)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProduct');
      });
    return warehouse.isLocked;
  }

  private async lockProduct(
    idSelf: number,
    idProduct: number,
    beLock: boolean,
  ): Promise<boolean> {
    const product = await this.productRepository
      .findById(idProduct)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundProduct');
      });

    if (beLock) {
      if (product.isLocked) {
        throw new HttpErrors.BadRequest('mgsProductLocked');
      } else {
        product.isLocked = true;
        product.whoLocked = String(idSelf);
        product.lockedAt = new Date();
      }
    } else {
      if (!product.isLocked) {
        throw new HttpErrors.BadRequest('mgsProductUnLocked');
      } else {
        product.isLocked = false;
      }
    }
    await this.productRepository.updateById(idProduct, product);
    return true;
  }

  private async checkRequire(
    value: Product,
  ): Promise<{result: boolean; values: Product}> {
    const warehouse = await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundsWarehouse');
      });

    await this.partnerRepository
      .findById(Number(warehouse.idPartner))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundPartner');
      });

    value.idPartner = value.idPartner ? value.idPartner : warehouse.idPartner;

    if (value.idCommodityUnit && value.idCommodityUnit !== '0') {
      await this.commodityUnitRepository
        .findById(Number(value.idCommodityUnit))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundCommodityUnit');
        });
    }
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

  // function
  public async getProducts(
    idSelf: number,
    idZone: number,
    idWarehouse: number,
    idCategory: number,
  ): Promise<Array<Product>> {
    // check
    const self = await this.getSelf(idSelf);

    return this.productRepository.getProductByOtherId(
      idZone,
      idWarehouse,
      Number(self.idPartner),
      idCategory,
    );
  }

  public async getTenantSelectionProductsTenant(
    idSelf: number,
    idWarehouse: string,
    idCate: string,
    search: string,
  ): Promise<Array<Product>> {
    const self = await this.getSelf(idSelf);

    return this.productRepository.find({
      where: {
        idWarehouse: idWarehouse,
        idPartner: self.idPartner,
        fullName: {nlike: search},
      },
    });
  }

  public async getProductSelection(
    idSelf: number,
    idWarehouse: string,
    idProductNotIn: string, // format '1','2','3'
    idProductIn: string, // format '1','2','3'
  ): Promise<Array<ProductSelection>> {
    const self = await this.getSelf(idSelf);

    const productNotIn =
      idProductNotIn && idProductNotIn.length > 0
        ? `and pr.id not in (${idProductNotIn})`
        : '';

    const productIn =
      idProductIn && idProductIn.length > 0
        ? `and pr.id in (${idProductIn})`
        : '';

    const command = `select sum(pz.quantity::integer) as quantity, pr.id ,pr.code, 
    pr."shortName", pr."fullName", pr.note, pr."idCommodityUnit", pr."idCategory", pr."totalQuantity",
    pr."imageProduct", pr."inComingQuantity", pr."outComingQuantity" , pr.barcode
    from product pr 
    left join "product-zone" pz on pr.id::text = pz."idProduct" 
    where pr."idWarehouse" = '${idWarehouse}' and pr."idPartner" = '${self.idPartner}'
    ${productNotIn}
    ${productIn}
    group by pr.id`;

    const products = await this.warehouseRepository.execute(command);
    return products as Array<ProductSelection>;
  }

  public async addComingProduct(
    idSelf: number,
    idProduct: number,
    quantity: number,
    typeRequest: RequestReceiptType,
  ) {
    // lock
    if (await this.lockProduct(idSelf, idProduct, true)) {
      const value = await this.productRepository
        .findById(idProduct)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundProduct');
        });

      if (typeRequest === RequestReceiptType.IMPORT) {
        value.inComingQuantity = value.inComingQuantity
          ? quantity.toString()
          : (Number(value.inComingQuantity) + quantity).toString();
      }

      if (typeRequest === RequestReceiptType.EXPORT) {
        value.outComingQuantity = value.outComingQuantity
          ? quantity.toString()
          : (Number(value.outComingQuantity) + quantity).toString();
      }

      await this.productRepository
        .updateById(idProduct, value)
        .finally(async () => {
          // unlock product
          await this.lockProduct(idSelf, idProduct, false);
        });
      return true;
    }
    return false;
  }

  public async getActive(
    idSelf: number,
    idProduct: string,
    idWarehouse: string,
    timeStart?: Date,
    timeEnd?: Date,
  ): Promise<HistoryProductBody[]> {
    const re: HistoryProductBody[] = [];
    await this.getSelf(idSelf);
    // if (timeEnd === undefined && timeStart === undefined) {
    // get all time
    // 1. get request

    const query = `
        select aa.*, bb.status, bb."receiptType" from 
        (select * from "detail-request-receipt" where "idProduct" = '${idProduct}') aa
        inner join 
        (select * from "request-receipt" where "idWarehouse" = '${idWarehouse}') bb 
        on aa."idReceipt" = bb.id::text`;

    // console.log(query);

    const detailRequest = (await this.detailRequestReceiptRepository.execute(
      query,
    )) as DetailRequestReceiptHistory[];

    detailRequest.forEach(value => {
      const old = re.filter(
        item =>
          item.time.getDate() === value.createdAt?.getDate() &&
          item.time.getMonth() === value.createdAt.getMonth() &&
          item.time.getFullYear() === value.createdAt.getFullYear(),
      );
      if (old.length > 0) {
        old[0].data.request = [...old[0].data.request, value];
      } else {
        re.push(<HistoryProductBody>{
          time: value.createdAt,
          data: {problem: [], loading: [], request: [value]},
        });
      }
    });

    const loading = await this.detailLoadingProductRepository.find({
      where: {idProduct: idProduct, idWarehouse: idWarehouse},
    });

    loading.forEach(value => {
      const old = re.filter(
        item =>
          item.time.getDate() === value.createdAt?.getDate() &&
          item.time.getMonth() === value.createdAt.getMonth() &&
          item.time.getFullYear() === value.createdAt.getFullYear(),
      );
      if (old.length > 0) {
        old[0].data.loading = [...old[0].data.loading, value];
      } else {
        re.push(<HistoryProductBody>{
          time: value.createdAt,
          data: {problem: [], loading: [value], request: []},
        });
      }
    });

    const problem = await this.problemProductRepository.find({
      where: {idProduct: idProduct, idWarehouse: idWarehouse},
    });

    problem.forEach(value => {
      const old = re.filter(
        item =>
          item.time.getDate() === value.createdAt?.getDate() &&
          item.time.getMonth() === value.createdAt.getMonth() &&
          item.time.getFullYear() === value.createdAt.getFullYear(),
      );
      if (old.length > 0) {
        old[0].data.problem = [...old[0].data.problem, value];
      } else {
        re.push(<HistoryProductBody>{
          time: value.createdAt,
          data: {problem: [value], loading: [], request: []},
        });
      }
    });
    return re;
  }

  public async createProductImg(
    idSelf: number,
    request: Request,
    response: Response,
  ): Promise<Product> {
    await this.getSelf(idSelf);

    const product = await this.extractProductValue(request, response);
    product.whoCreate = idSelf.toString();
    return this.productRepository.create(product);
    // if (re) {
    //   // send to admin
    //   const email =
    //     await this.insuranceMailFactoryService.buildInsuranceNotifyEmailToAdmin(
    //       re,
    //     );
    //   await this.mailService.send(email);
    // }
    // await this.handlerInsuranceTransactionService.handlerInsurance();
    // return re;
  }

  public async delete(idSelf: number, id: number): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockProduct(idSelf, id, true)) {
      await this.productRepository.deleteById(id).catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundPartner');
      });
      await this.detailRequestReceiptRepository.deleteAll({
        idProduct: id.toString(),
      });
      await this.detailLoadingProductRepository.deleteAll({
        idProduct: id.toString(),
      });
      await this.problemProductRepository.deleteAll({
        idProduct: id.toString(),
      });
      return true;
    }
    return false;
  }

  private async extractProductValue(
    request: Request,
    response: Response,
  ): Promise<Product> {
    let imgUrl = null;
    const {body, files} = (await this.fileHandler.uploadFilesWithBody(
      request,
      response,
    )) as {
      body: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
      files: Express.Multer.File[];
    };

    // if (!body.imgWalletClaim) {
    const file = files[0];
    if (!file) throw new HttpErrors.BadRequest('invalid_file');

    // Upload file on S3
    const fileUpload = await this.s3AWSService.uploadFile({
      folderName: this.productFolder,
      fileName: file.originalname,
      body: file.buffer,
      isPublic: true,
    });
    imgUrl = fileUpload.Location;
    // }

    return this.productFactory.buildProduct({
      barcode: body.barcode,
      code: body.code,
      fullName: body.fullName,
      idCategory: body.idCategory,
      idCommodityUnit: body.idCommodityUnit,
      imageProduct: imgUrl ? imgUrl : body.imageProduct,
      inComingQuantity: body.inComingQuantity,
      outComingQuantity: body.outComingQuantity,
      shortName: body.shortName,
      totalQuantity: body.totalQuantity,
      idPartner: body.idPartner,
      idWarehouse: body.idWarehouse,
    });
  }
}
