import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  WarehouseZone,
  WarehouseZoneType,
  WarehouseZoneStatus,
} from '../../models/warehouse/warehouse-zone.model';
import {WarehouseZoneRepository} from '../../repositories/warehouse/warehouse-zone.repository';

@bind()
export class WarehouseZoneFactoryService {
  constructor(
    @repository('WarehouseZoneRepository')
    private zoneWarehouseRepository: WarehouseZoneRepository,
  ) {}

  private static async buildWarehouseZone(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return new WarehouseZone({
      ...values,
      status: WarehouseZoneStatus.ACTIVE,
    });
  }

  public async buildWarehouseZoneDefault(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.DEFAULT,
      }),
    );
  }

  public async buildWarehouseZoneHead(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.HEAD,
      }),
    );
  }

  public async buildWarehouseZoneMiddle(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.MIDDLE,
      }),
    );
  }

  public async buildWarehouseZoneTail(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.TAIL,
      }),
    );
  }

  public async buildWarehouseZoneShipping(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.SHIPPING,
      }),
    );
  }

  public async buildWarehouseZonePacking(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.PACKING,
      }),
    );
  }

  public async buildWarehouseZoneShippingPacking(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.SHIPPING_PACKING,
      }),
    );
  }

  public async buildWarehouseZoneWaitingGoods(
    values: Pick<WarehouseZone, 'code'>,
  ): Promise<WarehouseZone> {
    return WarehouseZoneFactoryService.buildWarehouseZone(
      new WarehouseZone({
        ...values,
        warehouseType: WarehouseZoneType.WAITING_GOODS,
      }),
    );
  }
}
