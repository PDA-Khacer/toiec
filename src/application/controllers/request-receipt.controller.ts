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
import {RequestReceipt} from '../../domain/models/invoice/request-receipt.model';
import {RequestReceiptService} from '../services/admin/invoice/request-receipt.service';
import {
  ApproveRequestBody,
  RejectRequestBody,
  RequestReceiptBody,
} from '../../domain/models/rest/request/request-receipt.body';
import {DetailRequestReceipt} from '../../domain/models/invoice/detail-request-receipt.model';
import {ProductSelection} from '../../domain/models/warehouse/product.model';
import {Role} from '../../domain/models/account.model';
import {ApproveRequest} from '../../domain/models/invoice/approve-request.model';
import {ApproveRequestService} from '../services/admin/invoice/approve-request.service';
import {RejectRequest} from '../../domain/models/invoice/reject-request.model';
import {RejectRequestService} from '../services/admin/invoice/reject-request.service';
import {DetailRequestReceiptService} from '../services/admin/invoice/detail-request-receipt.service';
import {HistoryDetailRequestReceipt} from '../../domain/models/rest/request/loading-product.body';

export class RequestReceiptController {
  constructor(
    @service(RequestReceiptService)
    private requestReceiptService: RequestReceiptService,

    @service(ApproveRequestService)
    private approveRequestService: ApproveRequestService,

    @service(RejectRequestService)
    private rejectRequestService: RejectRequestService,

    @service(DetailRequestReceiptService)
    private detailRequestReceiptService: DetailRequestReceiptService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/request-receipt/import', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
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
          schema: {
            type: 'object',
            required: ['code'],
            properties: {
              code: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
              idTenant: {
                type: 'string',
              },
              idWarehouse: {
                type: 'string',
              },
              whoCreate: {
                type: 'string',
              },
              products: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: RequestReceiptBody,
  ): Promise<void> {
    return this.requestReceiptService.requestImport(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @post('/request-receipt/export', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async createExport(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['code'],
            properties: {
              code: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
              address: {
                type: 'string',
              },
              idTenant: {
                type: 'string',
              },
              idWarehouse: {
                type: 'string',
              },
              whoCreate: {
                type: 'string',
              },
              products: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: RequestReceiptBody,
  ): Promise<void> {
    return this.requestReceiptService.requestExport(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @post('/request-receipt/inspection', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async createInspection(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['code'],
            properties: {
              code: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
              idTenant: {
                type: 'string',
              },
              idWarehouse: {
                type: 'string',
              },
              whoCreate: {
                type: 'string',
              },
              products: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: RequestReceiptBody,
  ): Promise<void> {
    return this.requestReceiptService.requestInspection(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/request-receipt/count', {
    responses: {
      '200': {
        description: 'RequestReceipt model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async count(
    @param.query.object('where', getWhereSchemaFor(RequestReceipt))
    where?: Where<RequestReceipt>,
  ): Promise<Count> {
    return this.requestReceiptService.count(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/request-receipt', {
    responses: {
      '200': {
        description: 'Array of RequestReceipt model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(RequestReceipt)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(RequestReceipt))
    filter?: Filter<RequestReceipt>,
  ): Promise<RequestReceipt[]> {
    const filterOption: Filter<RequestReceipt> = {
      ...filter,
      // where: {isDeleted: {eq: false}},
    };

    return this.requestReceiptService.get(
      Number(this.currentAuthUserProfile[securityId]),
      filterOption,
    );
  }

  @get('/request-receipt/{id}', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(@param.path.string('id') id: number): Promise<RequestReceipt> {
    return this.requestReceiptService.getById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/request-receipt/{id}/product', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(DetailRequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findProductById(
    @param.path.string('id') id: number,
  ): Promise<Array<ProductSelection>> {
    return this.requestReceiptService.getProductById(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @get('/request-receipt/{id}/history-detail', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(DetailRequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async getDetailInfoRequest(
    @param.path.string('id') id: string,
  ): Promise<HistoryDetailRequestReceipt> {
    return this.detailRequestReceiptService.getDetailInfoRequest(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }

  @patch('/request-receipt/{id}', {
    responses: {
      '204': {
        description: 'RequestReceipt PATCH success',
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
          schema: getModelSchemaRef(RequestReceipt, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'RequestReceipt.Update',
          }),
        },
      },
    })
    user: RequestReceipt,
  ): Promise<void> {
    await this.requestReceiptService.updateRequestReceipt(
      Number(this.currentAuthUserProfile[securityId]),
      id,
      user,
    );
  }

  @post('/request-receipt/approve', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: [
      Role.WAREHOUSE_MANGER,
      Role.PARTNER_ADMIN,
      Role.PARTNER_ROOT_ADMIN,
    ],
  })
  async approve(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              note: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              expectedTime: {
                type: 'string',
              },
              idRequest: {
                type: 'string',
              },
              isAutoArrange: {
                type: 'boolean',
              },
              whoCreate: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: ApproveRequestBody,
  ): Promise<ApproveRequest> {
    const approveRequest = await this.approveRequestService.approveRequest(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
    await this.requestReceiptService.updateProductApprove(
      Number(this.currentAuthUserProfile[securityId]),
      Number(values.idRequest),
    );
    return approveRequest;
  }

  @post('/request-receipt/reject', {
    responses: {
      '200': {
        description: 'RequestReceipt model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RequestReceipt)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: [
      Role.WAREHOUSE_MANGER,
      Role.PARTNER_ADMIN,
      Role.PARTNER_ROOT_ADMIN,
    ],
  })
  async reject(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              note: {
                type: 'string',
              },
              reason: {
                type: 'string',
              },
              idRequest: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    values: RejectRequestBody,
  ): Promise<RejectRequest> {
    return this.rejectRequestService.rejectRequest(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @del('/request-receipt/{id}', {
    responses: {
      '204': {
        description: 'RequestReceipt DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.requestReceiptService.delete(
      Number(this.currentAuthUserProfile[securityId]),
      id,
    );
  }
}
