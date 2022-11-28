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
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {AUTHENTICATED, authorize} from '@loopback/authorization';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {config} from '@loopback/context';
import {
  Account,
  AccountConstraint,
  FormAssignAccount,
  Role,
} from '../../domain/models/account.model';
import {
  AccountRepository,
  WarehouseZoneRepository,
} from '../../infrastructure/repositories';
import {AccountTokenService} from '../services/account-token.service';
import {AccountService} from '../../domain/services/account.service';
import {NodeMailerMailService} from '../../infrastructure/services/nodemailer.service';
import {AccountAdminService} from '../services/admin/account.service';
import {AccountFactory} from '../../domain/services/account-factory.service';
import {AgencyAccountSendMailFactory} from '../services/account-send-mail-factory.service';
import {UtilService} from '../../domain/services/util.service';
import {
  Credentials,
  LocalAuthenticationService,
} from '../services/local-authentication.service';
import {getModelSchemaRefExtended} from '../utils/openapi-schema';
import {ConfigBindings} from '../../keys';

export class AccountController {
  constructor(
    @repository(WarehouseZoneRepository)
    private warehouseZoneRepository: WarehouseZoneRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(AccountTokenService)
    private accountTokenService: AccountTokenService,

    @service(NodeMailerMailService)
    private mailService: NodeMailerMailService,

    @service(AccountService)
    private accountService: AccountService,

    @service(AccountAdminService)
    private accountAdminService: AccountAdminService,

    @service(AgencyAccountSendMailFactory)
    private accountSendMailFactory: AgencyAccountSendMailFactory,

    @service(AccountFactory)
    private accountFactory: AccountFactory,

    @service(LocalAuthenticationService)
    private authenticationService: LocalAuthenticationService,

    @inject(SecurityBindings.USER, {optional: true})
    private currentAuthUserProfile: UserProfile,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  @post('/accounts', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Account)},
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
          schema: getModelSchemaRef(Account, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Account.Create',
          }),
        },
      },
    })
    values: Omit<Account, 'id'>,
  ): Promise<Account> {
    const account = await this.accountFactory.buildAccount(values);
    return this.accountRepository.create(account);
  }

  @get('/accounts/count', {
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
    @param.query.object('where', getWhereSchemaFor(Account))
    where?: Where<Account>,
  ): Promise<Count> {
    return this.accountRepository.count(where);
  }

  @get('/accounts', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Account)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(Account))
    filter?: Filter<Account>,
  ): Promise<Account[]> {
    const filterOption: Filter<Account> = {
      ...filter,
      where: {isDeleted: {eq: false}},
    };

    return this.accountRepository.find(filterOption);
  }

  @get('/accounts/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Account)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async findById(
    @param.path.string('id') id: string | number,
  ): Promise<Account> {
    const accountId = (
      id === 'me' ? this.currentAuthUserProfile[securityId] : id
    ) as number;

    const account = await this.accountRepository.findById(accountId);
    if (account.isDeleted) {
      return new Account();
    } else {
      account.password = '';
      return account;
    }
  }

  @patch('/accounts/{id}', {
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
          schema: getModelSchemaRef(Account, {
            partial: true,
            exclude: ['createdAt', 'updatedAt'],
            title: 'Account.Update',
          }),
        },
      },
    })
    user: Account,
  ): Promise<void> {
    await this.accountRepository.updateById(id, user);
  }

  @put('/accounts/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async replaceById(
    @param.path.string('id') id: number,
    @requestBody() user: Account,
  ): Promise<void> {
    await this.accountRepository.replaceById(id, user);
  }

  @del('/accounts/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.accountRepository.deleteById(id);
  }

  @post('/accounts/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRefExtended(Account, {
            include: ['username', 'password'],
            title: 'Account.Login',
          }),
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    const account = await this.authenticationService.verifyCredentials(
      credentials,
    );
    const userProfile =
      this.authenticationService.convertToUserProfile(account);
    const token = await this.accountTokenService.generateToken(userProfile);
    return {token};
  }

  @post('/accounts/signup', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRefExtended(Account, {
            include: ['username', 'email', 'password', 'role'],
          }),
        },
      },
    })
    values: Pick<Account, 'email' | 'username' | 'role' | 'password'>,
  ): Promise<Account> {
    try {
      let account = await this.accountFactory.buildAccount(values);
      account = await this.accountRepository.create(account);
      // No need to wait for email sending.
      console.log('oke here!!');
      await this.sendAccountVerificationEmail(account);
      return account;
    } catch (e) {
      throw UtilService.errorHandler(e);
    }
  }

  @post('/accounts/send-reset-password-email', {
    responses: {
      '204': {
        description:
          'The response should be empty. In the client should reload the page when the request is done.',
      },
      '404': {
        description: "User's email not found",
      },
      '400': {
        description:
          'System cannot generate reset password token or cannot send reset password email',
      },
    },
  })
  async sendResetPasswordEmail(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRefExtended(Account, {
            include: ['email'],
            title: 'Account.RequestResetPassword',
          }),
        },
      },
    })
    body: {
      email: string;
    },
  ): Promise<void> {
    const account = await this.accountRepository.findByEmail(body.email);

    if (!account) {
      throw new HttpErrors.NotFound('user_not_found');
    }

    const email = await this.accountSendMailFactory.buildResetPasswordEmail(
      account,
    );
    await this.mailService.send(email);
  }

  @post('/accounts/{id}/reset-password', {
    responses: {
      '204': {
        description:
          'The response should be empty. Reset password successfully.',
      },
      '404': {
        description: 'User not found',
      },
    },
  })
  async resetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['accountId', 'newPassword', 'resetPasswordToken'],
            properties: {
              accountId: {
                type: 'number',
              },
              newPassword: {
                type: 'string',
                minLength: AccountConstraint.PASSWORD_MIN_LENGTH,
                maxLength: AccountConstraint.PASSWORD_MAX_LENGTH,
              },
              resetPasswordToken: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    body: {
      accountId: number;
      newPassword: string;
      resetPasswordToken: string;
    },
  ): Promise<void> {
    const account = await this.accountTokenService.verifyResetPasswordToken(
      body.accountId,
      body.resetPasswordToken,
    );

    await this.accountService.setNewPassword(account, body.newPassword);
    await this.accountRepository.save(account);
  }

  @post('/accounts/{id}/reset-password-by-admin', {
    responses: {
      '204': {
        description:
          'The response should be empty. Reset password successfully.',
      },
      '404': {
        description: 'User not found',
      },
    },
  })
  async resetPasswordByAdmin(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['accountId', 'newPassword'],
            properties: {
              accountId: {
                type: 'number',
              },
              newPassword: {
                type: 'string',
                minLength: AccountConstraint.PASSWORD_MIN_LENGTH,
                maxLength: AccountConstraint.PASSWORD_MAX_LENGTH,
              },
            },
          },
        },
      },
    })
    body: {
      accountId: number;
      newPassword: string;
    },
  ): Promise<void> {
    const account = await this.accountRepository.findById(body.accountId);
    await this.accountService.setNewPassword(account, body.newPassword);
    await this.accountRepository.save(account);
  }

  @post('/accounts/me/change-password', {
    responses: {
      '204': {
        description:
          'The response should be empty. Change password successfully.',
      },
      '404': {
        description: 'User not found',
      },
      '400': {
        description: 'Cannot perform update password at Db Layer',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['currentPassword', 'newPassword'],
            properties: {
              currentPassword: {
                type: 'string',
                minLength: AccountConstraint.PASSWORD_MIN_LENGTH,
                maxLength: AccountConstraint.PASSWORD_MAX_LENGTH,
              },
              newPassword: {
                type: 'string',
                minLength: AccountConstraint.PASSWORD_MIN_LENGTH,
                maxLength: AccountConstraint.PASSWORD_MAX_LENGTH,
              },
            },
          },
        },
      },
    })
    body: {
      newPassword: string;
      currentPassword: string;
    },
  ): Promise<void> {
    const account = await this.accountRepository.findById(
      parseInt(this.currentAuthUserProfile[securityId]),
    );

    await this.accountService.changePassword(
      account,
      body.currentPassword,
      body.newPassword,
    );

    await this.accountRepository.save(account);
  }

  @post('/accounts/verify', {
    responses: {
      '204': {
        description: 'The response should be empty. Verify successfully.',
      },
      '404': {
        description: 'User not found',
      },
      '400': {
        description: 'JWT invalid',
      },
    },
  })
  async verifyAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['token'],
            properties: {
              token: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    body: {
      token: string;
    },
  ): Promise<void> {
    console.log('verify here!');
    const account =
      await this.accountTokenService.verifyAccountVerificationToken(body.token);

    account.verify();
    await this.accountRepository.save(account);
    console.log('init bot here!');
  }

  private async sendAccountVerificationEmail(account: Account): Promise<void> {
    const email =
      await this.accountSendMailFactory.buildAccountVerificationEmail(account);
    await this.mailService.send(email);
  }

  @get('/accounts/admins', {
    responses: {
      '200': {
        description: 'Array of admin account',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Account)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async findAdmins(
    @param.query.object('filter', getFilterSchemaFor(Account))
    filter?: Filter<Account>,
  ): Promise<Account[]> {
    const filterOption: Filter<Account> = {
      ...filter,
      where: {and: [{isDeleted: {eq: false}}, {role: Role.ROOT_ADMIN}]},
    };

    return this.accountRepository.find(filterOption);
  }

  @get('/accounts/admins/count', {
    responses: {
      '200': {
        description: 'Admin account count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async countAdmins(
    @param.query.object('where', getWhereSchemaFor(Account))
    where?: Where<Account>,
  ): Promise<Count> {
    const filterWhere = {
      and: [{...where}, {isDeleted: {eq: false}}, {role: Role.ROOT_ADMIN}],
    };
    return this.accountRepository.count(filterWhere);
  }

  @post('/accounts/send-user-email', {
    responses: {
      '204': {
        description: 'Send email for users',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [Role.ROOT_ADMIN]})
  async sendBotUserEmail(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              to: {
                type: 'array',
              },
              subject: {
                type: 'string',
              },
              content: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    body: {
      to: string[];
      content: string;
      subject: string;
    },
  ): Promise<boolean> {
    return this.accountSendMailFactory.sendCustomEmail(
      body.to,
      body.content,
      body.subject,
    );
  }

  // Partner
  @post('/accounts/partner', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Account)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async createPartner(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, {
            exclude: ['id', 'createdAt', 'updatedAt'],
            title: 'Account.Create',
          }),
        },
      },
    })
    values: Omit<Account, 'id'>,
  ): Promise<boolean> {
    return this.accountAdminService.createAccountPartner(
      Number(this.currentAuthUserProfile[securityId]),
      values,
    );
  }

  @get('/accounts/partner/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async countPartner(
    @param.query.object('where', getWhereSchemaFor(Account))
    where?: Where<Account>,
  ): Promise<Count> {
    return this.accountAdminService.countAccountPartner(
      Number(this.currentAuthUserProfile[securityId]),
      where,
    );
  }

  @get('/accounts/partner', {
    responses: {
      '200': {
        description: 'Array of User model instances',
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
  async findPartner(
    @param.query.object('filter', getFilterSchemaFor(Account))
    filter?: Filter<Account>,
  ): Promise<Account[]> {
    return this.accountAdminService.getAccountPartner(
      Number(this.currentAuthUserProfile[securityId]),
      filter,
    );
  }

  @get('/accounts/tenant-manager', {
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
    @param.query.string('idTenant')
    idTenant: string,
    @param.query.object('filter', getFilterSchemaFor(Account))
    filter?: Filter<Account>,
  ): Promise<Account[]> {
    return this.accountAdminService.getManagerTenant(
      Number(this.currentAuthUserProfile[securityId]),
      idTenant,
      filter,
    );
  }

  @get('/accounts/tenant-manager/count', {
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
    @param.query.string('idTenant')
    idTenant: string,
    @param.query.object('where', getWhereSchemaFor(Account))
    where?: Where<Account>,
  ): Promise<{count: string}> {
    return this.accountAdminService.countManagerTenant(
      Number(this.currentAuthUserProfile[securityId]),
      idTenant,
      where,
    );
  }

  @post('/accounts/assign', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Account)},
        },
      },
    },
  })
  async assign(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              fullName: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              x: {
                type: 'string',
              },
              y: {
                type: 'string',
              },
              z: {
                type: 'string',
              },
              capacity: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    body: FormAssignAccount,
  ): Promise<Account> {
    return this.accountAdminService.assignAccount(body);
  }

  @post('/accounts/selection-warehouse', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Account)},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [AUTHENTICATED]})
  async selectionWarehouse(
    @param.query.string('id') idWarehouse: string,
  ): Promise<boolean> {
    return this.accountAdminService.selectionWarehouse(
      Number(this.currentAuthUserProfile[securityId]),
      idWarehouse,
    );
  }
}
