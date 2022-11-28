import _isEmpty from 'lodash/isEmpty';
import {model, property, Entity} from '@loopback/repository';
import * as ejs from 'ejs';

export namespace SystemStatus {
  export const INITIALIZED = 'INITIALIZED';
}

export type SystemStatusData = {
  status: string;
};

export type MailSmtpSettings = {
  password: string;
  smtpHost: string;
  username: string;
  smtpPort: string;
  senderEmail: string;
  senderName: string;
};

export type BotUserGlobalFormula = {
  formula: string;
  isApplyAll: boolean;
};

interface EmailSettingData {
  emailTemplate: string;
  subject: string;
  senderEmail: string;
  senderName: string;
}
abstract class EmailSettings<CP> {
  emailTemplate: string;
  subject: string;
  senderEmail: string;
  senderName: string;

  constructor(options: EmailSettingData) {
    this.emailTemplate = options.emailTemplate;
    this.subject = options.subject;
    this.senderEmail = options.senderEmail;
    this.senderName = options.senderName;
  }

  abstract composeEmailContent(values: CP): string;

  abstract validateEmailTemplate(): boolean;
}

interface VerifyAccountEmailVariables {
  verificationLink: string;
}
export class VerifyAccountSettings extends EmailSettings<
  VerifyAccountEmailVariables
> {
  private static VerificationLinkVariable = 'ACCOUNT_VERIFICATION_LINK';

  constructor(options: EmailSettingData) {
    super(options);
  }

  public composeEmailContent(values: VerifyAccountEmailVariables): string {
    return ejs.render(this.emailTemplate, {
      [VerifyAccountSettings.VerificationLinkVariable]: values.verificationLink,
    });
  }

  public validateEmailTemplate(): boolean {
    const verificationLinkPlaceholder = `<%=${VerifyAccountSettings.VerificationLinkVariable}%>`;
    return this.emailTemplate.includes(verificationLinkPlaceholder);
  }
}

interface ResetPasswordEmailVariable {
  resetPasswordLink: string;
}
export class ResetPasswordSettings extends EmailSettings<
  ResetPasswordEmailVariable
> {
  private static ResetPasswordLinkVariable = 'RESET_PASSWORD_LINK';

  public composeEmailContent(values: ResetPasswordEmailVariable): string {
    return ejs.render(this.emailTemplate, {
      RESET_PASSWORD_LINK: values.resetPasswordLink,
    });
  }

  public validateEmailTemplate(): boolean {
    const verificationLinkPlaceholder = `<%=${ResetPasswordSettings.ResetPasswordLinkVariable}%>`;
    return this.emailTemplate.includes(verificationLinkPlaceholder);
  }
}

export class PrivacyTermSettings extends EmailSettings<null> {
  public composeEmailContent(): string {
    return ejs.render(this.emailTemplate);
  }

  public validateEmailTemplate(): boolean {
    return _isEmpty(this.emailTemplate);
  }
}

export type ConfigurationData =
  | SystemStatusData
  | MailSmtpSettings
  | ResetPasswordSettings
  | VerifyAccountSettings
  | PrivacyTermSettings
  | BotUserGlobalFormula;

export enum ConfigurationKey {
  SYSTEM_STATUS = 'SYSTEM_STATUS',
  MAIL_SMTP_SETTINGS = 'MAIL_SMTP_SETTINGS',
  RESET_PASSWORD_SETTINGS = 'RESET_PASSWORD_SETTINGS',
  VERIFY_ACCOUNT_SETTINGS = 'VERIFY_ACCOUNT_SETTINGS',
  PRIVACY_TERM_SETTINGS = 'PRIVACY_TERM_SETTINGS',
  BOT_USER_GLOBAL_FORMULA = 'BOT_USER_GLOBAL_FORMULA',
}

@model({settings: {idInjection: false}})
export class Configuration extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    jsonSchema: {
      enum: [
        ConfigurationKey.SYSTEM_STATUS,
        ConfigurationKey.MAIL_SMTP_SETTINGS,
        ConfigurationKey.RESET_PASSWORD_SETTINGS,
        ConfigurationKey.VERIFY_ACCOUNT_SETTINGS,
        ConfigurationKey.PRIVACY_TERM_SETTINGS,
        ConfigurationKey.BOT_USER_GLOBAL_FORMULA,
      ],
    },
  })
  id: ConfigurationKey;

  @property({
    type: 'object',
    postgresql: {
      dataType: 'json',
    },
  })
  data: ConfigurationData;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'createdAt',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'updatedAt',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<Configuration>) {
    super(data);
  }
}
