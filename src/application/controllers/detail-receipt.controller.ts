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
import {DetailReceiptService} from '../services/admin/invoice/detail-receipt.service';
import {DetailReceipt} from '../../domain/models/invoice/detail-receipt.model';

export class DetailReceiptController {
  constructor(
    @service(DetailReceiptService)
    private detailReceiptService: DetailReceiptService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthReceiptProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/product', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(DetailReceipt)},
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
          schema: getModelSchemaRef(DetailReceipt, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Receipt.Create',
          }),
        },
      },
    })
    values: Omit<DetailReceipt, 'id'>,
  ): Promise<boolean> {
    return this.detailReceiptService.createDetailReceipt(
      Number(this.currentAuthReceiptProfile[securityId]),
      values,
    );
  }

  @get('/product/count', {
    responses: {
      '200': {
        description: 'Receipt model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(DetailReceipt))
    where?: Where<DetailReceipt>,
  ): Promise<Count> {
    return this.detailReceiptService.count(
      Number(this.currentAuthReceiptProfile[securityId]),
      where,
    );
  }

  @get('/product', {
    responses: {
      '200': {
        description: 'Array of Receipt model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(DetailReceipt)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(DetailReceipt))
    filter?: Filter<DetailReceipt>,
  ): Promise<DetailReceipt[]> {
    const filterOption: Filter<DetailReceipt> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.detailReceiptService.get(
      Number(this.currentAuthReceiptProfile[securityId]),
      filterOption,
    );
  }

  @get('/product/{id}', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(DetailReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<DetailReceipt> {
    return this.detailReceiptService.getById(
      Number(this.currentAuthReceiptProfile[securityId]),
      id,
    );
  }

  @patch('/product/{id}', {
    responses: {
      '204': {
        description: 'Receipt PATCH success',
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
          schema: getModelSchemaRef(DetailReceipt, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Receipt.Update',
          }),
        },
      },
    })
    user: DetailReceipt,
  ): Promise<void> {
    await this.detailReceiptService.updateDetailReceipt(
      Number(this.currentAuthReceiptProfile[securityId]),
      id,
      user,
    );
  }

  // @del('/product/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'Receipt DELETE success',
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.productRepository.deleteById(id);
  // }
}
