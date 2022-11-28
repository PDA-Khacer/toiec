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
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {AUTHENTICATED, authorize} from '@loopback/authorization';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {config} from '@loopback/context';
import {ConfigBindings} from '../../keys';
import {ProductService} from '../services/admin/warehouse/product.service';
import {
  Product,
  ProductSelection,
} from '../../domain/models/warehouse/product.model';
import {DetailTenantWarehouseModel} from '../../domain/models/tenant/detail-tenant-warehouse.model';
import {FormLoadingProductBody} from '../../domain/models/rest/request/loading-product.body';
import {DetailLoadingService} from '../services/admin/invoice/detail-loading.service';
import {RequestReceiptService} from '../services/admin/invoice/request-receipt.service';
import {HistoryProductBody} from '../../domain/models/rest/request/history-product.body';

export class ProductController {
  constructor(
    @service(ProductService)
    private productService: ProductService,

    @service(DetailLoadingService)
    private detailLoadingService: DetailLoadingService,

    @service(RequestReceiptService)
    private requestReceiptService: RequestReceiptService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthProductProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/product', {
    responses: {
      '200': {
        description: 'Product model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Product)},
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
          schema: getModelSchemaRef(Product, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Product.Create',
          }),
        },
      },
    })
    values: Omit<Product, 'id'>,
  ): Promise<boolean> {
    return this.productService.createProduct(
      Number(this.currentAuthProductProfile[securityId]),
      values,
    );
  }

  @post('/product/file', {
    responses: {
      '200': {
        description: 'Product model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Product)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async createWithImg(
    @requestBody({
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              files: {type: 'object'},
              inComingQuantity: {type: 'string'},
              outComingQuantity: {type: 'string'},
              code: {type: 'string'},
              barcode: {type: 'string'},
              shortName: {type: 'string'},
              fullName: {type: 'string'},
              status: {type: 'string'},
              idCategory: {type: 'string'},
              idCommodityUnit: {type: 'string'},
              totalQuantity: {type: 'string'},
              imageProduct: {type: 'string'},
              idWarehouse: {type: 'string'},
              idPartner: {type: 'string'},
            },
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Product> {
    return this.productService.createProductImg(
      Number(this.currentAuthProductProfile[securityId]),
      request,
      response,
    );
  }

  @get('/product/count', {
    responses: {
      '200': {
        description: 'Product model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(Product))
    where?: Where<Product>,
  ): Promise<Count> {
    return this.productService.count(
      Number(this.currentAuthProductProfile[securityId]),
      where,
    );
  }

  @get('/product', {
    responses: {
      '200': {
        description: 'Array of Product model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Product))
    filter?: Filter<Product>,
  ): Promise<Product[]> {
    const filterOption: Filter<Product> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.productService.get(
      Number(this.currentAuthProductProfile[securityId]),
      filterOption,
    );
  }

  @get('/product/{id}', {
    responses: {
      '200': {
        description: 'Product model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Product)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<Product> {
    return this.productService.getById(
      Number(this.currentAuthProductProfile[securityId]),
      id,
    );
  }

  @patch('/product/{id}', {
    responses: {
      '204': {
        description: 'Product PATCH success',
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
          schema: getModelSchemaRef(Product, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Product.Update',
          }),
        },
      },
    })
    user: Product,
  ): Promise<void> {
    await this.productService.updateProduct(
      Number(this.currentAuthProductProfile[securityId]),
      id,
      user,
    );
  }

  // @del('/product/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'Product DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.productRepository.deleteById(id);
  // }
  @get('/product/tenant/selection', {
    responses: {
      '200': {
        description: 'Array of Product model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getTenantSelectionProductsTenant(
    @param.query.string('idWarehouse')
    idWarehouse: string,
    @param.query.string('idCate')
    idCate: string,
    @param.query.string('search')
    search: string,
  ): Promise<Product[]> {
    return this.productService.getTenantSelectionProductsTenant(
      Number(this.currentAuthProductProfile[securityId]),
      idWarehouse,
      idCate,
      search,
    );
  }

  @get('/product/tenant/selection-not-in', {
    responses: {
      '200': {
        description: 'Array of Product model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getProductSelection(
    @param.query.string('idWarehouse')
    idWarehouse: string,
    @param.query.string('idProductNotIn')
    idProductNotIn: string,
    @param.query.string('idProductIn')
    idProductIn: string,
  ): Promise<Array<ProductSelection>> {
    return this.productService.getProductSelection(
      Number(this.currentAuthProductProfile[securityId]),
      idWarehouse,
      idProductNotIn,
      idProductIn,
    );
  }

  @post('/product/loading', {
    responses: {
      '200': {
        description: 'Loading product model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(DetailTenantWarehouseModel),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async createDiscount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              idRequest: {
                type: 'string',
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    img: {
                      type: 'string',
                    },
                    note: {
                      type: 'string',
                    },
                    idZone: {
                      type: 'string',
                    },
                    quantity: {
                      type: 'string',
                    },
                    idProduct: {
                      type: 'string',
                    },
                    idRequest: {
                      type: 'string',
                    },
                    idTenant: {
                      type: 'string',
                    },
                    idWarehouse: {
                      type: 'string',
                    },
                    startAt: {
                      type: 'string',
                    },
                    doneAt: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    values: FormLoadingProductBody,
  ): Promise<boolean> {
    await this.detailLoadingService.loadingProduct(
      Number(this.currentAuthProductProfile[securityId]),
      values,
    );
    return true;
  }

  @get('/product/loading/receipt', {
    responses: {
      '200': {
        description: 'Array of Product model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getLoadingProduct(
    @param.query.string('idReceipt')
    idReceipt: string,
  ): Promise<{}> {
    const idSelf = Number(this.currentAuthProductProfile[securityId]);
    const productSelection = await this.requestReceiptService.getProductById(
      idSelf,
      Number(idReceipt),
    );

    return this.detailLoadingService.getLoadingProduct(
      idSelf,
      idReceipt,
      productSelection,
    );
  }

  @get('/product/active', {
    responses: {
      '200': {
        description: 'Array of Product detail model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getActive(
    @param.query.string('idProduct')
    idProduct: string,
    @param.query.string('idWarehouse')
    idWarehouse: string,
    @param.query.string('timeStart')
    timeStart: string,
    @param.query.string('timeEnd')
    timeEnd: string,
  ): Promise<HistoryProductBody[]> {
    return this.productService.getActive(
      Number(this.currentAuthProductProfile[securityId]),
      idProduct,
      idWarehouse,
    );
  }

  @del('/product/{id}', {
    responses: {
      '204': {
        description: 'product DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productService.delete(
      Number(this.currentAuthProductProfile[securityId]),
      id,
    );
  }
}
