import {HttpErrors} from '@loopback/rest';
import {UserService as UserAuthenticationService} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {service} from '@loopback/core';
import {AccountRepository} from '../../infrastructure/repositories';
import {Account, Role} from '../../domain/models/account.model';
import {PasswordHasher} from '../../domain/services/password-hasher.service';
import {BcryptPasswordHasher} from '../../infrastructure/services/bcrypt-password-hasher.service';

export type Credentials = {
  username: string;
  password: string;
};

@bind()
export class LocalAuthenticationService
  implements UserAuthenticationService<Account, Credentials>
{
  constructor(
    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(BcryptPasswordHasher)
    private passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Account> {
    let account = null;

    // Find account by username
    account = await this.accountRepository.findByUsername(credentials.username);

    if (!account) {
      // Find account by email
      account = await this.accountRepository.findByEmail(credentials.username);

      if (!account || !account.isActive()) {
        throw new HttpErrors.Unauthorized('invalid_credentials_username');
      }
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      account.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('invalid_credentials_password');
    }

    return account;
  }

  // async botUserVerifyCredentials(credentials: Credentials): Promise<Account> {
  //   let account = null;
  //
  //   // Find account by username
  //   account = await this.accountRepository.findByUsername(credentials.username);
  //
  //   if (!account) {
  //     // Find account by email
  //     account = await this.accountRepository.findByEmail(credentials.username);
  //   }
  //
  //   if (!account || !account.isActive()) {
  //     throw new HttpErrors.Unauthorized('invalid_credentials_username');
  //   }
  //
  //   if (account.role !== Role.BOT_USER) {
  //     throw new HttpErrors.Unauthorized('dont_have_permission');
  //   }
  //
  //   const botUser = await this.botUserRepository.findOne({
  //     where: {accountId: account.id},
  //   });
  //
  //   if (!botUser) {
  //     throw new HttpErrors.Unauthorized('dont_have_bot_user');
  //   }
  //
  //   if (botUser.endDate <= new Date()) {
  //     throw new HttpErrors.Unauthorized('bot_user_is_expired');
  //   }
  //
  //   const passwordMatched = await this.passwordHasher.comparePassword(
  //     credentials.password,
  //     account.password,
  //   );
  //
  //   if (!passwordMatched) {
  //     throw new HttpErrors.Unauthorized('invalid_credentials_password');
  //   }
  //
  //   return account;
  // }

  convertToUserProfile(user: Account): UserProfile {
    return {[securityId]: user.id.toString(), username: user.username};
  }
}
