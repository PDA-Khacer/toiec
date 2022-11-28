import {inject, service} from '@loopback/core';
import {Count, CountSchema, Filter, Where} from '@loopback/repository';
import {
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
import {DetailTenantWarehouseService} from '../services/admin/tenant/detail-tenant-warehouse.service';
import {
  DetailTenantWarehouseModel,
  DetailTenantWarehouseStatus,
} from '../../domain/models/tenant/detail-tenant-warehouse.model';
import {
  DiscountPrices,
  DiscountPricesStatus,
} from '../../domain/models/tenant/discount-prices.model';
import {DiscountPricesService} from '../services/admin/tenant/discount-tentant-warehouse.service';
import {SettingPrices} from '../../domain/models/tenant/setting-prices.model';
import {SettingPricesService} from '../services/admin/tenant/setting-prices.service';

export class DetailTenantWarehouseController {
  constructor(
    @service(DetailTenantWarehouseService)
    private detailTenantWarehouseService: DetailTenantWarehouseService,

    @service(DiscountPricesService)
    private discountPricesService: DiscountPricesService,

    @service(SettingPricesService)
    private settingPricesService: SettingPricesService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/detail-tenant', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse model instance',
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
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
              },
              idWarehouse: {
                type: 'string',
              },
              numberSKU: {
                type: 'string',
              },
              startDate: {
                type: 'string',
              },
              expDate: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: {
      code: string;
      idWarehouse: string;
      numberSKU: string;
      startDate: Date;
      expDate: Date;
    },
  ): Promise<boolean> {
    const detailWarehouseCer: Pick<
      DetailTenantWarehouseModel,
      'idWarehouse' | 'numberSKU' | 'startDate' | 'expDate' | 'code'
    > = {
      idWarehouse: values.idWarehouse,
      numberSKU: values.numberSKU,
      startDate: values.startDate,
      expDate: values.expDate,
      code: values.code,
    };
    return this.detailTenantWarehouseService.createDetailTenantWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      detailWarehouseCer,
    );
  }

  @get('/detail-tenant/count', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(DetailTenantWarehouseModel))
    where?: Where<DetailTenantWarehouseModel>,
  ): Promise<Count> {
    return this.detailTenantWarehouseService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/detail-tenant', {
    responses: {
      '200': {
        description: 'Array of DetailTenantWarehouse model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(DetailTenantWarehouseModel),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object(
      'filter',
      getFilterSchemaFor(DetailTenantWarehouseModel),
    )
    filter?: Filter<DetailTenantWarehouseModel>,
  ): Promise<DetailTenantWarehouseModel[]> {
    const filterOption: Filter<DetailTenantWarehouseModel> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.detailTenantWarehouseService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/detail-tenant/{id}', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse model instance',
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
  async findById(
    @param.path.string('id') id: number,
  ): Promise<DetailTenantWarehouseModel> {
    return this.detailTenantWarehouseService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @patch('/detail-tenant/{id}', {
    responses: {
      '204': {
        description: 'DetailTenantWarehouse PATCH success',
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
          schema: getModelSchemaRef(DetailTenantWarehouseModel, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'DetailTenantWarehouse.Update',
          }),
        },
      },
    })
    user: DetailTenantWarehouseModel,
  ): Promise<void> {
    await this.detailTenantWarehouseService.updateDetailTenantWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @post('/detail-tenant/{id}/approve', {
    responses: {
      '204': {
        description: 'DetailTenantWarehouse PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async approveTenant(@param.path.number('id') id: number): Promise<void> {
    await this.detailTenantWarehouseService.updateStatusDetailTenantWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      DetailTenantWarehouseStatus.SUCCESS,
    );
  }

  @post('/detail-tenant/{id}/reject', {
    responses: {
      '204': {
        description: 'DetailTenantWarehouse PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async rejectTenant(@param.path.number('id') id: number): Promise<void> {
    await this.detailTenantWarehouseService.updateStatusDetailTenantWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      DetailTenantWarehouseStatus.REJECT,
    );
  }

  // @del('/detail-tenant/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'DetailTenantWarehouse DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.productRepository.deleteById(id);
  // }

  // ================ Discount =======================

  @post('/detail-tenant/discount', {
    responses: {
      '200': {
        description: 'Discount model instance',
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
              discount: {
                type: 'string',
              },
              idWarehouse: {
                type: 'string',
              },
              timeStart: {
                type: 'string',
              },
              timeEnd: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: {
      discount: string;
      idWarehouse: string;
      timeStart: Date;
      timeEnd: Date;
    },
  ): Promise<boolean> {
    const discount: Pick<
      DiscountPrices,
      'idWarehouse' | 'discount' | 'timeStart' | 'timeEnd'
    > = {
      idWarehouse: values.idWarehouse,
      discount: values.discount,
      timeStart: values.timeStart,
      timeEnd: values.timeEnd,
    };
    return this.discountPricesService.createDiscountPrices(
      Number(this.currentAuthUserProfile[securityId]),
      discount,
    );
  }

  @get('/detail-tenant/discount/count', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async countDiscount(
    @param.query.object('where', getWhereSchemaFor(DiscountPrices))
    where?: Where<DiscountPrices>,
  ): Promise<Count> {
    return this.discountPricesService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/detail-tenant/discount', {
    responses: {
      '200': {
        description: 'Array of DetailTenantWarehouse model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(DiscountPrices),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findDiscount(
    @param.query.object('filter', getFilterSchemaFor(DiscountPrices))
    filter?: Filter<DiscountPrices>,
  ): Promise<DiscountPrices[]> {
    const filterOption: Filter<DiscountPrices> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.discountPricesService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/detail-tenant/discount/{id}', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(DiscountPrices),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findDiscountById(
    @param.path.string('id') id: number,
  ): Promise<DiscountPrices> {
    return this.discountPricesService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @patch('/detail-tenant/discount/{id}', {
    responses: {
      '204': {
        description: 'DetailTenantWarehouse PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async updateDiscountById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DiscountPrices, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'DetailTenantWarehouse.Update',
          }),
        },
      },
    })
    user: DiscountPrices,
  ): Promise<void> {
    await this.discountPricesService.updateDiscountPrices(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @patch('/detail-tenant/discount/{id}/status', {
    responses: {
      '204': {
        description: 'DetailTenantWarehouse PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async updateStatus(
    @param.path.number('id') id: number,
    @param.query.string('status') status: DiscountPricesStatus,
  ): Promise<void> {
    await this.discountPricesService.updateStatusDiscountPrices(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      status,
    );
  }

  // ================= Setting ====================
  @post('/detail-tenant/setting', {
    responses: {
      '200': {
        description: 'Discount model instance',
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
  async createSetting(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SettingPrices, {
            exclude: [
              'id',
              'createdAt',
              'updatedAt',
              'whoCreate',
              'whoLocked',
              'lockedAt',
              'isLocked',
            ],
            title: 'Setting.Create',
          }),
        },
      },
    })
    values: Omit<SettingPrices, 'id'>,
  ): Promise<boolean> {
    return this.settingPricesService.createSettingPrices(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/detail-tenant/setting/me', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse setting model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SettingPrices),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getSettingWarehouse(): Promise<SettingPrices | null> {
    return this.settingPricesService.getSettingWarehouseBySelf(
      Number(this.currentAuthUserProfile[securityId]),
      true,
    );
  }

  @get('/detail-tenant/setting/warehouse/{id}', {
    responses: {
      '200': {
        description: 'DetailTenantWarehouse setting model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SettingPrices),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getByIdWarehouse(
    @param.path.number('id') id: string,
  ): Promise<SettingPrices | null> {
    return this.settingPricesService.getByIdWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @patch('/detail-tenant/setting/me', {
    responses: {
      '204': {
        description: 'Receipt PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async updateSettingByMe(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SettingPrices, {
            partial: true,
            exclude: [
              'id',
              'createdAt',
              'updatedAt',
              'whoCreate',
              'whoLocked',
              'lockedAt',
              'isLocked',
            ],
            title: 'SettingPrices.Update',
          }),
        },
      },
    })
    setting: SettingPrices,
  ): Promise<void> {
    await this.settingPricesService.updateSettingPricesWarehouseBySelf(
      Number(this.currentAuthUserProfile[securityId]),
      setting,
    );
  }
}
