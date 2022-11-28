import {bind} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';

@bind()
export class UtilService {
  static errorHandler = (e: Error) => {
    switch (e.name) {
      case 'IllegalArgumentError':
        throw new HttpErrors.BadRequest('duplicated_email_or_username');
      default:
        throw new HttpErrors.BadRequest('Bruh');
    }
  };
}
