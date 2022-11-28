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
import {WarehouseZone} from '../../domain/models/warehouse/warehouse-zone.model';
import {WarehouseZoneService} from '../services/admin/warehouse/warehouse-zone.service';

export class WarehouseZoneController {
  constructor(
    @service(WarehouseZoneService)
    private warehouseZoneService: WarehouseZoneService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/warehouse-zone', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(WarehouseZone)},
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
          schema: getModelSchemaRef(WarehouseZone, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'WarehouseZone.Create',
          }),
        },
      },
    })
    values: Omit<WarehouseZone, 'id'>,
  ): Promise<boolean> {
    return this.warehouseZoneService.createWarehouseZone(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/warehouse-zone/count', {
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
    @param.query.object('where', getWhereSchemaFor(WarehouseZone))
    where?: Where<WarehouseZone>,
  ): Promise<Count> {
    return this.warehouseZoneService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/warehouse-zone', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(WarehouseZone)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(WarehouseZone))
    filter?: Filter<WarehouseZone>,
  ): Promise<WarehouseZone[]> {
    const filterOption: Filter<WarehouseZone> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.warehouseZoneService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/warehouse-zone/warehouse', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(WarehouseZone)},
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
  ): Promise<WarehouseZone[]> {
    return this.warehouseZoneService.getWithWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }

  @get('/warehouse-zone/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(WarehouseZone)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<WarehouseZone> {
    return this.warehouseZoneService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  // @get('/warehouse-zone/me', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {
  //         'application/json': {schema: getModelSchemaRef(WarehouseZone)},
  //       },
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [AUTHENTICATED]})
  // async findBySelf(): Promise<WarehouseZone> {
  //   return this.warehouseZoneService.getBySelf(
  //     Number(this.currentAuthUserProfile[securityId]),
  //   );
  // }

  @patch('/warehouse-zone/{id}', {
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
          schema: getModelSchemaRef(WarehouseZone, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'WarehouseZone.Update',
          }),
        },
      },
    })
    user: WarehouseZone,
  ): Promise<void> {
    await this.warehouseZoneService.updateWarehouseZone(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }
}
