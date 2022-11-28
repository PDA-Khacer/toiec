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
import {Warehouse} from '../../domain/models/warehouse/warehouse.model';
import {WarehouseService} from '../services/admin/warehouse/warehouse.service';
import {Account} from '../../domain/models/account.model';
import {TypeGetTenantWarehouse} from '../../domain/models/tenant/detail-tenant-warehouse.model';
// import {Role} from '../../domain/models/account.model';

export class WarehouseController {
  constructor(
    @service(WarehouseService)
    private warehouseService: WarehouseService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/warehouse', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Warehouse)},
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
          schema: getModelSchemaRef(Warehouse, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Warehouse.Create',
          }),
        },
      },
    })
    values: Omit<Warehouse, 'id'>,
  ): Promise<boolean> {
    return this.warehouseService.createWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/warehouse/count', {
    responses: {
      '200': {
        description: 'Warehouse model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(Warehouse))
    where?: Where<Warehouse>,
  ): Promise<Count> {
    return this.warehouseService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/warehouse', {
    responses: {
      '200': {
        description: 'Array of Warehouse model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Warehouse)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Warehouse))
    filter?: Filter<Warehouse>,
  ): Promise<Warehouse[]> {
    const filterOption: Filter<Warehouse> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.warehouseService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/warehouse/{id}', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Warehouse)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<Warehouse> {
    return this.warehouseService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/warehouse/me', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Warehouse)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findBySelf(): Promise<Warehouse> {
    return this.warehouseService.getBySelf(
      Number(this.currentAuthUserProfile[securityId]),
    );
  }

  @get('/warehouse/selection', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Warehouse)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getSelection(): Promise<Warehouse> {
    return this.warehouseService.getSelection(
      Number(this.currentAuthUserProfile[securityId]),
    );
  }

  @patch('/warehouse/{id}', {
    responses: {
      '204': {
        description: 'Warehouse PATCH success',
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
          schema: getModelSchemaRef(Warehouse, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Warehouse.Update',
          }),
        },
      },
    })
    user: Warehouse,
  ): Promise<void> {
    await this.warehouseService.updateWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  // @del('/warehouse/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'Warehouse DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.warehouseRepository.deleteById(id);
  // }

  @get('/warehouse/manager', {
    responses: {
      '200': {
        description: 'Array of manager account',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Account)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getManager(
    @param.query.string('idWarehouse')
    idWarehouse: string,
    @param.query.object('filter', getFilterSchemaFor(Account))
    filter?: Filter<Account>,
  ): Promise<Account[]> {
    return this.warehouseService.getManagerWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
      filter,
    );
  }

  @get('/warehouse/manager/count', {
    responses: {
      '200': {
        description: 'Warehouse model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async countManager(
    @param.query.string('idWarehouse')
    idWarehouse: string,
    @param.query.object('where', getWhereSchemaFor(Account))
    where?: Where<Account>,
  ): Promise<{count: string}> {
    return this.warehouseService.countManagerWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
      where,
    );
  }

  @get('/warehouse/not-tenant', {
    responses: {
      '200': {
        description: 'Array of manager warehouse not tenanted',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Account)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getNotTenant(
    @param.query.object('filter', getFilterSchemaFor(Warehouse))
    filter?: Filter<Warehouse>,
  ): Promise<Warehouse[]> {
    return this.warehouseService.getWarehouseNotTenanted(
      Number(this.currentAuthUserProfile[securityId]),
      filter,
    );
  }

  @get('/warehouse/not-tenant/count', {
    responses: {
      '200': {
        description: 'Warehouse model not tenanted count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async countNotTenant(
    @param.query.object('where', getWhereSchemaFor(Warehouse))
    where?: Where<Warehouse>,
  ): Promise<{count: string}> {
    return this.warehouseService.countWarehouseNotTenanted(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/warehouse/tenant', {
    responses: {
      '200': {
        description: 'Warehouse model not tenanted count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getAllWarehouseTenanted(
    @param.query.string('typeGet')
    typeGet: TypeGetTenantWarehouse,
  ): Promise<Array<Warehouse>> {
    return this.warehouseService.getAllWarehouseTenanted(
      Number(this.currentAuthUserProfile[securityId]),
      typeGet,
    );
  }
}
