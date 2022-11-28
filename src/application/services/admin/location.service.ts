import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  LocationRepository,
} from '../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {
  Location,
  LocationCategory,
  LocationStatus,
} from '../../../domain/models/location.model';
import {Account} from '../../../domain/models/account.model';
import {LocationFactory} from '../../../domain/services/location-factory.service';

@bind()
export class LocationService {
  constructor(
    @repository(LocationRepository)
    private locationRepository: LocationRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(LocationFactory)
    private locationFactory: LocationFactory,
  ) {}

  public async createLocation(
    idSelf: number,
    values: Omit<Location, 'id'>,
    type: LocationCategory,
  ): Promise<boolean> {
    try {
      // check
      const self = await this.getSelf(idSelf);
      // create
      let location: Location;
      switch (type) {
        case LocationCategory.SYSTEM:
          location = await this.locationFactory.buildLocationSystem(values);
          location.idPartner = self.idPartner;
          break;
        case LocationCategory.SELF:
          location = await this.locationFactory.buildLocationSelf(values);
          break;
      }
      location.whoCreate = self.id.toString();
      await this.locationRepository.create(location);
      return true;
    } catch (e) {
      console.log(
        '[ERR] src/infrastructure/services/partner.service.ts:20',
        e.toString(),
      );
      return false;
    }
  }

  public async getById(
    idSelf: number,
    idLocation: number,
  ): Promise<Location | null> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockLocation(idSelf, idLocation))) {
      return this.locationRepository.findById(idLocation).catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundLocation');
      });
    }
    return null;
  }

  public async get(
    idSelf: number,
    filter?: Filter<Location>,
  ): Promise<Array<Location>> {
    // check
    await this.getSelf(idSelf);
    return this.locationRepository.find(filter);
  }

  public async count(idSelf: number, where?: Where<Location>): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.locationRepository.count(where);
  }

  public async updateLocation(
    idSelf: number,
    idLocation: number,
    value: Location,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockLocation(idSelf, idLocation, true)) {
      await this.locationRepository
        .updateById(idLocation, value)
        .finally(async () => {
          // unlock partner
          await this.lockLocation(idSelf, idLocation, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusLocation(
    idSelf: number,
    idLocation: number,
    status: LocationStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockLocation(idSelf, idLocation, true)) {
      const value = await this.locationRepository
        .findById(idLocation)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundLocation');
        });
      value.status = status;
      await this.locationRepository
        .updateById(idLocation, value)
        .finally(async () => {
          // unlock partner
          await this.lockLocation(idSelf, idLocation, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockLocation(
    idSelf: number,
    idLocation: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const partner = await this.locationRepository
      .findById(idLocation)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundLocation');
      });
    return partner.isLocked;
  }

  private async lockLocation(
    idSelf: number,
    idLocation: number,
    beLock: boolean,
  ): Promise<boolean> {
    const location = await this.locationRepository
      .findById(idLocation)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundLocation');
      });

    if (location.isLocked) {
      throw new HttpErrors.BadRequest('mgsLocationLocked');
    } else {
      if (beLock) {
        location.isLocked = true;
        location.whoLocked = String(idSelf);
        location.lockedAt = new Date();
      } else {
        location.isLocked = false;
      }
      await this.locationRepository.updateById(idLocation, location);
      return true;
    }
  }

  private async getSelf(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {id: id, isDeleted: false},
    });
    if (!account) {
      throw new HttpErrors.NotFound('msgNotFoundAccount');
    }

    if (account.expDate <= new Date()) {
      throw new HttpErrors.BadRequest('msgAccountExpDate');
    }

    if (account.isCustomRole) {
      // check role
    }

    return account;
  }
}
