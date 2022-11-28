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
import {ProductZone} from '../../domain/models/warehouse/product-zone.model';
import {ProductZoneService} from '../services/admin/warehouse/product-zone.service';

export class ProductZoneZoneController {
  constructor(
    @service(ProductZoneService)
    private productZoneService: ProductZoneService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthProductZoneProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/product-zone', {
    responses: {
      '200': {
        description: 'ProductZone model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductZone)},
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
          schema: getModelSchemaRef(ProductZone, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'ProductZone.Create',
          }),
        },
      },
    })
    values: Omit<ProductZone, 'id'>,
  ): Promise<boolean> {
    return this.productZoneService.createProductZone(
      Number(this.currentAuthProductZoneProfile[securityId]),
      values,
    );
  }

  @get('/product-zone/count', {
    responses: {
      '200': {
        description: 'ProductZone model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(ProductZone))
    where?: Where<ProductZone>,
  ): Promise<Count> {
    return this.productZoneService.count(
      Number(this.currentAuthProductZoneProfile[securityId]),
      where,
    );
  }

  @get('/product-zone', {
    responses: {
      '200': {
        description: 'Array of ProductZone model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProductZone)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProductZone))
    filter?: Filter<ProductZone>,
  ): Promise<ProductZone[]> {
    const filterOption: Filter<ProductZone> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.productZoneService.get(
      Number(this.currentAuthProductZoneProfile[securityId]),
      filterOption,
    );
  }

  @get('/product-zone/{id}', {
    responses: {
      '200': {
        description: 'ProductZone model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductZone)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<ProductZone> {
    return this.productZoneService.getById(
      Number(this.currentAuthProductZoneProfile[securityId]),
      id,
    );
  }

  @patch('/product-zone/{id}', {
    responses: {
      '204': {
        description: 'ProductZone PATCH success',
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
          schema: getModelSchemaRef(ProductZone, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'ProductZone.Update',
          }),
        },
      },
    })
    user: ProductZone,
  ): Promise<void> {
    await this.productZoneService.updateProductZone(
      Number(this.currentAuthProductZoneProfile[securityId]),
      id,
      user,
    );
  }

  // @del('/product-zone/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'ProductZone DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.productRepository.deleteById(id);
  // }
}
