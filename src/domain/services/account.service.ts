import {bind, inject} from '@loopback/context';
import {Account} from '../models/account.model';
import {PasswordHasher} from './password-hasher.service';
import {HttpErrors} from '@loopback/rest';
import {isEqual} from 'lodash';

@bind()
export class AccountService {
  constructor(
    @inject('services.BcryptPasswordHasher')
    private passwordHasher: PasswordHasher,
  ) {}

  public async setNewPassword(
    account: Account,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await this.passwordHasher.hashPassword(newPassword);
    account.setNewPassword(hashedPassword);
  }

  public async changePassword(
    account: Account,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const currentPasswordIsCorrect = await this.passwordHasher.comparePassword(
      currentPassword,
      account.password,
    );

    if (!currentPasswordIsCorrect) {
      throw new HttpErrors.Unauthorized('invalid_current_password');
    }
    if (isEqual(currentPassword, newPassword)) {
      throw new HttpErrors.Unauthorized('same_current_password');
    }

    await this.setNewPassword(account, newPassword);
  }
}
