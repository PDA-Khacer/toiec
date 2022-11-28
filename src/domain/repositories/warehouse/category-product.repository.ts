export interface CategoryProductRepository {
  canCreateSubCate(idFather: number): Promise<boolean>;
}
