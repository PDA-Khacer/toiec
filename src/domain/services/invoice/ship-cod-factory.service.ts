import {bind} from '@loopback/context';
import {ShipCOD} from '../../models/invoice/ship-cod.model';

@bind()
export class ShipCODFactory {
  constructor() {} // private productRepository: ShipCODRepository, // @repository('ShipCODRepository')

  public async buildShipCOD(
    values: Pick<
      ShipCOD,
      'note' | 'code' | 'status' | 'whoShip' | 'timeStart' | 'timeEnd' | 'cash'
    >,
  ): Promise<ShipCOD> {
    return new ShipCOD({
      ...values,
    });
  }
}
