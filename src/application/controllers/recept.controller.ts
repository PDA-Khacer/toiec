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
import {ReceiptService} from '../services/admin/invoice/receipt.service';
import {Receipt} from '../../domain/models/invoice/receipt.model';

export class ReceiptController {
  constructor(
    @service(ReceiptService)
    private receiptService: ReceiptService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthReceiptProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/receipt', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Receipt)},
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
          schema: getModelSchemaRef(Receipt, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Receipt.Create',
          }),
        },
      },
    })
    values: Omit<Receipt, 'id'>,
  ): Promise<boolean> {
    return this.receiptService.createReceipt(
      Number(this.currentAuthReceiptProfile[securityId]),
      values,
    );
  }

  @get('/receipt/count', {
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
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.receiptService.count(
      Number(this.currentAuthReceiptProfile[securityId]),
      where,
    );
  }

  @get('/receipt', {
    responses: {
      '200': {
        description: 'Array of Receipt model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Receipt)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Receipt))
    filter?: Filter<Receipt>,
  ): Promise<Receipt[]> {
    const filterOption: Filter<Receipt> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.receiptService.get(
      Number(this.currentAuthReceiptProfile[securityId]),
      filterOption,
    );
  }

  @get('/receipt/{id}', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Receipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<Receipt> {
    return this.receiptService.getById(
      Number(this.currentAuthReceiptProfile[securityId]),
      id,
    );
  }

  @patch('/receipt/{id}', {
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
          schema: getModelSchemaRef(Receipt, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Receipt.Update',
          }),
        },
      },
    })
    user: Receipt,
  ): Promise<void> {
    await this.receiptService.updateReceipt(
      Number(this.currentAuthReceiptProfile[securityId]),
      id,
      user,
    );
  }

  // @del('/receipt/{id}', {
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
