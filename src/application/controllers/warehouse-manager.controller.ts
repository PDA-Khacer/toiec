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
import {WarehouseManager} from '../../domain/models/warehouse/warehouse-manager.model';
import {WarehouseManagerService} from '../services/admin/warehouse/warehouse-manager.service';

export class WarehouseManagerController {
  constructor(
    @service(WarehouseManagerService)
    private warehouseManagerService: WarehouseManagerService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthWarehouseProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/warehouse-manager', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(WarehouseManager)},
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
          schema: getModelSchemaRef(WarehouseManager, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Warehouse.Create',
          }),
        },
      },
    })
    values: Omit<WarehouseManager, 'id'>,
  ): Promise<boolean> {
    return this.warehouseManagerService.createWarehouseManager(
      Number(this.currentAuthWarehouseProfile[securityId]),
      values,
    );
  }

  @get('/warehouse-manager/count', {
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
    @param.query.object('where', getWhereSchemaFor(WarehouseManager))
    where?: Where<WarehouseManager>,
  ): Promise<Count> {
    return this.warehouseManagerService.count(
      Number(this.currentAuthWarehouseProfile[securityId]),
      where,
    );
  }

  @get('/warehouse-manager', {
    responses: {
      '200': {
        description: 'Array of Warehouse model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(WarehouseManager)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(WarehouseManager))
    filter?: Filter<WarehouseManager>,
  ): Promise<WarehouseManager[]> {
    const filterOption: Filter<WarehouseManager> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.warehouseManagerService.get(
      Number(this.currentAuthWarehouseProfile[securityId]),
      filterOption,
    );
  }

  @get('/warehouse-manager/{id}', {
    responses: {
      '200': {
        description: 'Warehouse model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(WarehouseManager)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(
    @param.path.string('id') id: number,
  ): Promise<WarehouseManager> {
    return this.warehouseManagerService.getById(
      Number(this.currentAuthWarehouseProfile[securityId]),
      id,
    );
  }

  @patch('/warehouse-manager/{id}', {
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
          schema: getModelSchemaRef(WarehouseManager, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Warehouse.Update',
          }),
        },
      },
    })
    values: WarehouseManager,
  ): Promise<void> {
    await this.warehouseManagerService.updateWarehouseManager(
      Number(this.currentAuthWarehouseProfile[securityId]),
      id,
      values,
    );
  }

  // @del('/warehouse-manager/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'Warehouse DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.warehouseManagerRepository.deleteById(id);
  // }
}
