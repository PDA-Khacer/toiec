import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  Location,
  LocationCategory,
  LocationStatus,
} from '../models/location.model';
import {LocationRepository} from '../repositories/location.repository';

@bind()
export class LocationFactory {
  constructor(
    @repository('LocationRepository')
    private locationRepository: LocationRepository,
  ) {}

  private static async buildLocation(
    values: Pick<Location, 'idPartner'>,
  ): Promise<Location> {
    return new Location({
      ...values,
      status: LocationStatus.ACTIVE,
    });
  }

  public async buildLocationSystem(
    values: Pick<Location, 'idPartner'>,
  ): Promise<Location> {
    return LocationFactory.buildLocation(
      new Location({
        ...values,
        locationCategory: LocationCategory.SYSTEM,
      }),
    );
  }

  public async buildLocationSelf(
    values: Pick<Location, 'idPartner'>,
  ): Promise<Location> {
    return LocationFactory.buildLocation(
      new Location({
        ...values,
        locationCategory: LocationCategory.SELF,
      }),
    );
  }
}
