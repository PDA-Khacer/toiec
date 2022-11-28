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
import {CustomRoleRepository} from '../../infrastructure/repositories';
import {ConfigBindings} from '../../keys';
import {CustomRoleService} from '../services/admin/custom-role.service';
import {CustomRole} from '../../domain/models/custom-role.model';

export class CustomRoleController {
  constructor(
    @repository(CustomRoleRepository)
    private customRoleRepository: CustomRoleRepository,

    @service(CustomRoleService)
    private customRoleService: CustomRoleService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/custom-role', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CustomRole)},
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
          schema: getModelSchemaRef(CustomRole, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'CustomRole.Create',
          }),
        },
      },
    })
    values: Omit<CustomRole, 'id'>,
  ): Promise<boolean> {
    return this.customRoleService.createCustomRole(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/custom-role/count', {
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
    @param.query.object('where', getWhereSchemaFor(CustomRole))
    where?: Where<CustomRole>,
  ): Promise<Count> {
    return this.customRoleService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/custom-role', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomRole)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(CustomRole))
    filter?: Filter<CustomRole>,
  ): Promise<CustomRole[]> {
    const filterOption: Filter<CustomRole> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.customRoleService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/custom-role/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CustomRole)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(
    @param.path.string('id') id: number,
  ): Promise<CustomRole | null> {
    return this.customRoleService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @patch('/custom-role/{id}', {
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
          schema: getModelSchemaRef(CustomRole, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'CustomRole.Update',
          }),
        },
      },
    })
    user: CustomRole,
  ): Promise<void> {
    await this.customRoleService.updateCustomRole(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @del('/custom-role/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.customRoleRepository.deleteById(id);
  }
}
