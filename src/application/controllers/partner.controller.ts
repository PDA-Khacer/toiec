import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
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
import {PartnerRepository} from '../../infrastructure/repositories';
import {ConfigBindings} from '../../keys';
import {PartnerService} from '../services/admin/partner.service';
import {PartnerFactory} from '../../domain/services/partner-factory.server';
import {Partner} from '../../domain/models/partner.model';
import {Role} from '../../domain/models/account.model';

export class PartnerController {
  constructor(
    @repository(PartnerRepository)
    private partnerRepository: PartnerRepository,

    @service(PartnerService)
    private partnerService: PartnerService,

    @service(PartnerFactory)
    private partnerFactory: PartnerFactory,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/partner', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Partner)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partner, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Partner.Create',
          }),
        },
      },
    })
    values: Omit<Partner, 'id'>,
  ): Promise<boolean> {
    return this.partnerService.createPartner(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/partner/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async count(
    @param.query.object('where', getWhereSchemaFor(Partner))
    where?: Where<Partner>,
  ): Promise<Count> {
    return this.partnerService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/partner', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Partner)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Partner))
    filter?: Filter<Partner>,
  ): Promise<Partner[]> {
    const filterOption: Filter<Partner> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.partnerService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/partner/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Partner)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<Partner> {
    return this.partnerService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/partner/me', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Partner)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findBySelf(): Promise<Partner> {
    return this.partnerService.getBySelf(
      Number(this.currentAuthUserProfile[securityId]),
    );
  }

  @patch('/partner/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partner, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Partner.Update',
          }),
        },
      },
    })
    user: Partner,
  ): Promise<void> {
    await this.partnerService.updatePartner(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @del('/partner/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.partnerRepository.deleteById(id);
  }
}
