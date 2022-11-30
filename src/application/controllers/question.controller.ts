import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
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
import {SecurityBindings, UserProfile} from '@loopback/security';
import {config} from '@loopback/context';
import {QuestionRepository} from '../../infrastructure/repositories';
import {ConfigBindings} from '../../keys';
import {Role} from '../../domain/models/account.model';
import {QuestionService} from '../services/admin/toiec/question.service';
import {Question} from '../../domain/models/toiec/question.model';

export class QuestionController {
  constructor(
    @repository(QuestionRepository)
    private questionRepository: QuestionRepository,

    @service(QuestionService)
    private questionService: QuestionService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/question', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Question)},
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
          schema: getModelSchemaRef(Question, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Question.Create',
          }),
        },
      },
    })
    values: Omit<Question, 'id'>,
  ): Promise<Question> {
    return this.questionService.createQuestion(values);
  }

  @get('/question/count', {
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
    @param.query.object('where', getWhereSchemaFor(Question))
    where?: Where<Question>,
  ): Promise<Count> {
    return this.questionService.count(
      where,
    );
  }

  @get('/question', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Question)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Question))
    filter?: Filter<Question>,
  ): Promise<Question[]> {
    const filterOption: Filter<Question> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.questionService.get(
      filterOption,
    );
  }

  @get('/question/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Question)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<Question> {
    return this.questionService.getById(
      id,
    );
  }

  @patch('/question/{id}', {
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
          schema: getModelSchemaRef(Question, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Question.Update',
          }),
        },
      },
    })
    user: Question,
  ): Promise<void> {
    await this.questionService.updateQuestion(
      id,
      user,
    );
  }

  // @del('/question/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'User DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.partnerRepository.deleteById(id);
  // }
}
