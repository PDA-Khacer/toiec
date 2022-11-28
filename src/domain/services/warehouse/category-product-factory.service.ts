import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  CategoryProduct,
  CategoryProductArea,
  CategoryProductStatus,
} from '../../models/warehouse/category-product.model';
import {CategoryProductRepository} from '../../repositories/warehouse/category-product.repository';
import {HttpErrors} from '@loopback/rest';

@bind()
export class CategoryProductFactory {
  constructor(
    @repository('CategoryProductRepository')
    private categoryProductRepository: CategoryProductRepository,
  ) {}

  private async buildCategoryProduct(
    values: Pick<CategoryProduct, 'code' | 'idCateFather'>,
  ): Promise<CategoryProduct> {
    if (values.idCateFather !== '0') {
      const canCreate = await this.categoryProductRepository.canCreateSubCate(
        Number(values.idCateFather),
      );

      if (!canCreate) {
        throw new HttpErrors.BadRequest('msgMaxLvlCateProduct');
      }
    }

    return new CategoryProduct({
      ...values,
      status: CategoryProductStatus.ACTIVE,
    });
  }

  public async buildCategoryProductSystem(
    values: Pick<CategoryProduct, 'code' | 'idCateFather'>,
  ): Promise<CategoryProduct> {
    return this.buildCategoryProduct(
      new CategoryProduct({
        ...values,
        categoryProductArea: CategoryProductArea.SYSTEM,
      }),
    );
  }

  public async buildCategoryProductWarehouse(
    values: Pick<CategoryProduct, 'code' | 'idCateFather'>,
  ): Promise<CategoryProduct> {
    return this.buildCategoryProduct(
      new CategoryProduct({
        ...values,
        categoryProductArea: CategoryProductArea.WAREHOUSE,
      }),
    );
  }
}
