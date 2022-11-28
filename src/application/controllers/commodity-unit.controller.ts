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
import {CommodityUnitService} from '../services/admin/warehouse/commodity-unit.service';
import {CommodityUnit} from '../../domain/models/warehouse/commodity-unit.model';
import {CategoryProduct} from '../../domain/models/warehouse/category-product.model';

export class CommodityUnitController {
  constructor(
    @service(CommodityUnitService)
    private commodityUnitService: CommodityUnitService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/commodity-unit', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CommodityUnit)},
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
          schema: getModelSchemaRef(CommodityUnit, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'CommodityUnit.Create',
          }),
        },
      },
    })
    values: Omit<CommodityUnit, 'id'>,
  ): Promise<boolean> {
    return this.commodityUnitService.createCommodityUnit(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/commodity-unit/count', {
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
    @param.query.object('where', getWhereSchemaFor(CommodityUnit))
    where?: Where<CommodityUnit>,
  ): Promise<Count> {
    return this.commodityUnitService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/commodity-unit', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CommodityUnit)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(CommodityUnit))
    filter?: Filter<CommodityUnit>,
  ): Promise<CommodityUnit[]> {
    const filterOption: Filter<CommodityUnit> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.commodityUnitService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/commodity-unit/warehouse', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CommodityUnit)},
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
  ): Promise<CommodityUnit[]> {
    return this.commodityUnitService.getCommodityUnitOfWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }

  @get('/commodity-unit/tenant', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CommodityUnit)},
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
  ): Promise<CommodityUnit[]> {
    return this.commodityUnitService.getCommodityUnitOfTenant(
      Number(this.currentAuthUserProfile[securityId]),
      idTenant,
    );
  }

  @get('/commodity-unit/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CommodityUnit)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<CommodityUnit> {
    return this.commodityUnitService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  // @get('/commodity-unit/me', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {
  //         'application/json': {schema: getModelSchemaRef(CommodityUnit)},
  //       },
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [AUTHENTICATED]})
  // async findBySelf(): Promise<CommodityUnit> {
  //   return this.commodityUnitService.getBySelf(
  //     Number(this.currentAuthUserProfile[securityId]),
  //   );
  // }

  @patch('/commodity-unit/{id}', {
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
          schema: getModelSchemaRef(CommodityUnit, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'CommodityUnit.Update',
          }),
        },
      },
    })
    user: CommodityUnit,
  ): Promise<void> {
    await this.commodityUnitService.updateCommodityUnit(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @del('/commodity-unit/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.commodityUnitService.delete(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/commodity-unit/me/warehouse/all', {
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
  ): Promise<Array<CommodityUnit>> {
    return this.commodityUnitService.getBySelfInWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }
}
