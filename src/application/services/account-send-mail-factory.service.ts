import {bind, config} from '@loopback/context';
import {service} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {Account, Role} from '../../domain/models/account.model';
import {
  AccountRepository,
  ConfigurationRepository,
} from '../../infrastructure/repositories';
import {AccountTokenService} from './account-token.service';
import {ConfigBindings} from '../../keys';
import {Email} from '../../infrastructure/services/nodemailer.service';
import {getMailAgencyAssignToAdmin} from '../utils/mail-content';
import * as ejs from 'ejs';
const nodemailer = require('nodemailer');

@bind()
export class AgencyAccountSendMailFactory {
  private static AGENCY_USERNAME = 'AGENCY_USERNAME';
  private static AGENCY_EMAIL = 'AGENCY_EMAIL';
  private static NOW = 'NOW';
  constructor(
    @repository(ConfigurationRepository)
    private configurationRepository: ConfigurationRepository,

    @service(AccountTokenService)
    private accountTokenService: AccountTokenService,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'frontEndBaseUrl',
    })
    private frontEndBaseUrl: string,
  ) {}

  public async buildMailAgencyAssignToAdmin(
    username: string,
    email: string,
  ): Promise<Email> {
    const subject = 'Have new agency assign';
    const emailContent = await this.getMailAgencyAssignToAdmin(username, email);
    const lstAdmin = await this.accountRepository.find({
      where: {role: Role.ROOT_ADMIN},
    });

    const listEmailAdmin = lstAdmin.map(value => {
      return value.email;
    });

    return {
      subject: subject,
      senderEmail: 'no-reply@aiphoenix.tech',
      senderName: 'AIPhoenix.tech',
      content: emailContent,
      recipient: listEmailAdmin,
    };
  }

  public async getMailAgencyAssignToAdmin(
    username: string,
    email: string,
  ): Promise<string> {
    const tempContent = getMailAgencyAssignToAdmin();
    return ejs.render(tempContent, {
      [AgencyAccountSendMailFactory.AGENCY_USERNAME]: username,
      [AgencyAccountSendMailFactory.AGENCY_EMAIL]: email,
      [AgencyAccountSendMailFactory.NOW]: new Date().toUTCString(),
    });
  }

  public async buildAccountVerificationEmail(account: Account): Promise<Email> {
    if (!account.canVerifyEmail()) {
      throw new HttpErrors.Forbidden('invalid_account');
    }

    const emailSettings =
      await this.configurationRepository.getAccountVerificationEmailSettings();

    if (!emailSettings) {
      throw new Error('email_settings_not_found');
    }

    const token =
      this.accountTokenService.generateAccountVerificationToken(account);
    const link = `${this.frontEndBaseUrl}/verify-account?token=${token}`;

    const emailContent = emailSettings.composeEmailContent({
      verificationLink: link,
    });

    return {
      subject: emailSettings.subject,
      senderEmail: emailSettings.senderEmail,
      senderName: emailSettings.senderName,
      content: emailContent,
      recipient: account.email,
    };
  }

  public async buildResetPasswordEmail(account: Account): Promise<Email> {
    if (!account.isActive()) {
      throw new HttpErrors.Forbidden('inactive_account');
    }

    const emailSettings =
      await this.configurationRepository.getResetPasswordEmailSettings();

    if (!emailSettings) {
      throw new Error('email_settings_not_found');
    }

    const token = this.accountTokenService.generateResetPasswordToken(account);
    const link =
      account.role === Role.ROOT_ADMIN
        ? `${this.frontEndBaseUrl}/admin/reset-new-password?accountId=${account.id}&token=${token}`
        : `${this.frontEndBaseUrl}/reset-new-password?accountId=${account.id}&token=${token}`;
    const emailContent = emailSettings.composeEmailContent({
      resetPasswordLink: link,
    });

    return {
      subject: emailSettings.subject,
      senderEmail: emailSettings.senderEmail,
      senderName: emailSettings.senderName,
      content: emailContent,
      recipient: account.email,
    };
  }

  public async buildPrivacyTermEmail(email: string): Promise<Email> {
    const emailSettings =
      await this.configurationRepository.getPrivacyTermEmailSettings();

    if (!emailSettings) {
      throw new Error('email_settings_not_found');
    }

    const emailContent = emailSettings.composeEmailContent();

    return {
      subject: emailSettings.subject,
      senderEmail: emailSettings.senderEmail,
      senderName: emailSettings.senderName,
      content: emailContent,
      recipient: email,
    };
  }

  public async sendCustomEmail(
    to: string[],
    content: string,
    subject: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sendEmail = async () => {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.USER_NAME, // generated ethereal user
            pass: process.env.PASSWORD, // generated ethereal password
          },
        });

        // send mail with defined transport object
        const info = transporter.sendMail({
          from: process.env.FROM, // sender address
          to: to.join(','), // list of receivers
          subject: subject, // Subject line
          html: content, // html body
        });

        return info;
      };
      sendEmail()
        .then(data => {
          resolve(true);
        })
        .catch(error => {
          console.log(error);
          resolve(false);
        });
    });
  }
}
