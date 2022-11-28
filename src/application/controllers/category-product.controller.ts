import {inject, service} from '@loopback/core';
import {Count, CountSchema, Filter, Where} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {AUTHENTICATED, authorize} from '@loopback/authorization';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {config} from '@loopback/context';
import {ConfigBindings} from '../../keys';
import {
  CategoryProduct,
  TreeNode,
} from '../../domain/models/warehouse/category-product.model';
import {CategoryProductService} from '../services/admin/warehouse/category-product.service';

export class CategoryProductController {
  constructor(
    @service(CategoryProductService)
    private categoryProductService: CategoryProductService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/category-product', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CategoryProduct)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CategoryProduct, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'CategoryProduct.Create',
          }),
        },
      },
    })
    values: Omit<CategoryProduct, 'id'>,
  ): Promise<boolean> {
    return this.categoryProductService.createCategoryProduct(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/category-product/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(CategoryProduct))
    where?: Where<CategoryProduct>,
  ): Promise<Count> {
    return this.categoryProductService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/category-product', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(CategoryProduct))
    filter?: Filter<CategoryProduct>,
  ): Promise<CategoryProduct[]> {
    const filterOption: Filter<CategoryProduct> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.categoryProductService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/category-product/me/warehouse/all', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getBySelfInWarehouse(
    @param.query.string('idWarehouse') idWarehouse: string,
  ): Promise<Array<CategoryProduct>> {
    return this.categoryProductService.getBySelfInWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }

  @get('/category-product/tree', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async treeData(@param.query.string('id') id: number): Promise<TreeNode> {
    return this.categoryProductService.getTreeCategory(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/category-product/trees', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async treeAll(): Promise<Array<TreeNode>> {
    return this.categoryProductService.getAllTreeCategory(
      Number(this.currentAuthUserProfile[securityId]),
    );
  }

  @get('/category-product/warehouse', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getWithWarehouse(
    @param.query.string('idWarehouse')
    idWarehouse: string,
  ): Promise<CategoryProduct[]> {
    return this.categoryProductService.getWithWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }

  @get('/category-product/tenant', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CategoryProduct)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getWithTenant(
    @param.query.string('idTenant')
    idTenant: string,
  ): Promise<CategoryProduct[]> {
    return this.categoryProductService.getWithTenant(
      Number(this.currentAuthUserProfile[securityId]),
      idTenant,
    );
  }

  @get('/category-product/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CategoryProduct)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(
    @param.path.string('id') id: number,
  ): Promise<CategoryProduct> {
    return this.categoryProductService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  // @get('/category-product/me', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {
  //         'application/json': {schema: getModelSchemaRef(CategoryProduct)},
  //       },
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [AUTHENTICATED]})
  // async findBySelf(): Promise<CategoryProduct> {
  //   return this.categoryProductService.getBySelf(
  //     Number(this.currentAuthUserProfile[securityId]),
  //   );
  // }

  @patch('/category-product/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CategoryProduct, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'CategoryProduct.Update',
          }),
        },
      },
    })
    user: CategoryProduct,
  ): Promise<void> {
    await this.categoryProductService.updateCategoryProduct(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @del('/category-product/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.categoryProductService.delete(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }
}
