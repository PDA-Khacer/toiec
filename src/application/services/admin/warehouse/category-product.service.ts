import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  CategoryProductRepository,
  PartnerRepository,
  ProductRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {
  Account,
  AccountCategory,
} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {CategoryProductFactory} from '../../../../domain/services/warehouse/category-product-factory.service';
import {
  CategoryProduct,
  CategoryProductArea,
  CategoryProductStatus,
  TreeNode,
} from '../../../../domain/models/warehouse/category-product.model';

@bind()
export class CategoryProductService {
  constructor(
    @repository(CategoryProductRepository)
    private categoryProductRepository: CategoryProductRepository,

    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @repository(ProductRepository)
    private productRepository: ProductRepository,

    @service(CategoryProductFactory)
    private categoryProductFactory: CategoryProductFactory,
  ) {}

  public async createCategoryProduct(
    idSelf: number,
    values: Omit<CategoryProduct, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let categoryProduct: CategoryProduct;
    if (values.categoryProductArea === CategoryProductArea.SYSTEM) {
      categoryProduct =
        await this.categoryProductFactory.buildCategoryProductSystem(values);
    } else {
      categoryProduct =
        await this.categoryProductFactory.buildCategoryProductWarehouse(values);
      const warehouse = await this.warehouseRepository
        .findById(Number(values.idWarehouse))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
        });
      values.idPartner = values.idPartner
        ? values.idPartner
        : warehouse.idPartner;
    }

    await this.checkRequire(categoryProduct);

    categoryProduct.whoCreate = self.id.toString();
    await this.categoryProductRepository.create(categoryProduct);
    return true;
  }

  public async getById(
    idSelf: number,
    idCategory: number,
  ): Promise<CategoryProduct> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockCategoryProduct(idSelf, idCategory))) {
      return this.categoryProductRepository
        .findById(idCategory)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundCategoryProduct');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<CategoryProduct>,
  ): Promise<Array<CategoryProduct>> {
    // check
    await this.getSelf(idSelf);
    return this.categoryProductRepository.find(filter);
  }

  public async count(
    idSelf: number,
    where?: Where<CategoryProduct>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.categoryProductRepository.count(where);
  }

  public async updateCategoryProduct(
    idSelf: number,
    idWarehouse: number,
    value: CategoryProduct,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCategoryProduct(idSelf, idWarehouse, true)) {
      await this.categoryProductRepository
        .updateById(idWarehouse, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockCategoryProduct(idSelf, idWarehouse, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusCategoryProduct(
    idSelf: number,
    idCategory: number,
    status: CategoryProductStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCategoryProduct(idSelf, idCategory, true)) {
      const value = await this.categoryProductRepository
        .findById(idCategory)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundCategoryProduct');
        });
      value.status = status;
      await this.categoryProductRepository
        .updateById(idCategory, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockCategoryProduct(idSelf, idCategory, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockCategoryProduct(
    idSelf: number,
    idCategoryProduct: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const categoryProduct = await this.categoryProductRepository
      .findById(idCategoryProduct)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCategoryProduct');
      });
    return categoryProduct.isLocked;
  }

  private async lockCategoryProduct(
    idSelf: number,
    idCategoryProduct: number,
    beLock: boolean,
  ): Promise<boolean> {
    const categoryProduct = await this.categoryProductRepository
      .findById(idCategoryProduct)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundCategoryProduct');
      });

    if (beLock) {
      if (categoryProduct.isLocked) {
        throw new HttpErrors.BadRequest('mgsCategoryProductLocked');
      } else {
        categoryProduct.isLocked = true;
        categoryProduct.whoLocked = String(idSelf);
        categoryProduct.lockedAt = new Date();
      }
    } else {
      if (!categoryProduct.isLocked) {
        throw new HttpErrors.BadRequest('mgsCategoryProductUnLocked');
      } else {
        categoryProduct.isLocked = false;
      }
    }
    await this.categoryProductRepository.updateById(
      idCategoryProduct,
      categoryProduct,
    );
    return true;
  }

  private async checkRequire(value: CategoryProduct): Promise<boolean> {
    if (value.idWarehouse !== null && value.idWarehouse !== '0') {
      await this.warehouseRepository
        .findById(Number(value.idWarehouse))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundWarehouse');
        });
    }

    if (value.categoryProductArea === CategoryProductArea.SYSTEM) {
      await this.partnerRepository
        .findById(Number(value.idPartner))
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundPartner');
        });
    }

    return true;
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

  public async getAllTreeCategory(idSelf: number): Promise<Array<TreeNode>> {
    // check
    const self = await this.getSelf(idSelf);
    let categories;
    if (
      self.accountCategory === AccountCategory.WAREHOUSE ||
      self.accountCategory === AccountCategory.PARTNER_WAREHOUSE
    ) {
      const warehouse = await this.warehouseRepository.findOne({
        where: {idPartner: self.idPartner},
      });
      if (!warehouse) {
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      }
      categories = await this.categoryProductRepository.find({
        where: {idWarehouse: warehouse.id.toString(), idCateFather: '0'},
      });
    } else if (
      self.accountCategory === AccountCategory.PARTNER_TENANT ||
      self.accountCategory === AccountCategory.TENANT
    ) {
      categories = await this.categoryProductRepository.find({
        where: {
          whoCreate: self.id.toString(),
          idCateFather: '0',
          idWarehouse: self.warehouseSelection,
        },
      });
    }
    if (!categories) {
      return [];
    }
    const re = [] as Array<TreeNode>;
    for (const cate of categories) {
      re.push(await this.getTreeCategory(idSelf, cate.id));
    }
    return re;
  }

  // function
  public async getTreeCategory(
    idSelf: number,
    idCategoryProduct: number,
  ): Promise<TreeNode> {
    // check
    await this.getSelf(idSelf);

    //
    const rootCate = await this.categoryProductRepository
      .findById(idCategoryProduct)
      .catch(reason => {
        console.log(reason.toString());
        throw new HttpErrors.NotFound('msgNotFoundCategory');
      });

    return {
      id: rootCate.id,
      title: rootCate.shortName,
      lvl: 0,
      subNode: await this.getSubNode(rootCate.id, 0),
    } as TreeNode;
  }

  private async getSubNode(
    idCategoryProduct: number,
    lvl: number,
  ): Promise<Array<TreeNode>> {
    if (lvl > Number(process.env.NUMBER_LVL_CATE)) {
      return [];
    }

    const subTree = await this.categoryProductRepository.find({
      where: {
        idCateFather: idCategoryProduct.toString(),
        status: CategoryProductStatus.ACTIVE,
      },
    });
    const subNode = [] as Array<TreeNode>;
    for (const item of subTree) {
      subNode.push({
        id: item.id,
        lvl: lvl + 1,
        title: item.shortName,
        subNode: await this.getSubNode(item.id, lvl + 1),
      });
    }
    return subNode;
  }

  public async getWithWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<Array<CategoryProduct>> {
    await this.getSelf(idSelf);
    return this.categoryProductRepository.find({
      where: {idWarehouse: idWarehouse, idCateFather: '0'},
    });
  }

  public async getWithTenant(
    idSelf: number,
    idTenant: string,
  ): Promise<Array<CategoryProduct>> {
    await this.getSelf(idSelf);
    return this.categoryProductRepository.find({
      where: {idPartner: idTenant},
    });
  }

  public async getBySelfInWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<Array<CategoryProduct>> {
    const self = await this.getSelf(idSelf);
    return this.categoryProductRepository.find({
      where: {idPartner: self.idPartner, idWarehouse: idWarehouse},
    });
  }

  public async updateAfterDeleteCateFather(id: number): Promise<void> {
    const allNeedUpdate = await this.categoryProductRepository.find({
      where: {idCateFather: id.toString()},
    });

    for (const item of allNeedUpdate) {
      item.idCateFather = '0';
      await this.categoryProductRepository.updateById(item.id, item);
    }
  }

  public async delete(idSelf: number, id: number): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockCategoryProduct(idSelf, id, true)) {
      await this.categoryProductRepository.deleteById(id).catch(() => {
        throw new HttpErrors.NotFound('msgNotFoundCategory');
      });
      await this.updateAfterDeleteCateFather(id);
      return true;
    }
    return false;
  }
}
