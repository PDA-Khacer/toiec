import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  CommodityUnitStatus,
  CommodityUnit,
  CommodityUnitArea,
} from '../../models/warehouse/commodity-unit.model';
import {CommodityUnitRepository} from '../../repositories/warehouse/commodity-unit.repository';

@bind()
export class CommodityUnitFactory {
  constructor(
    @repository('CommodityUnitRepository')
    private productZoneRepository: CommodityUnitRepository,
  ) {}

  private static async buildCommodityUnit(
    values: Pick<CommodityUnit, 'code'>,
  ): Promise<CommodityUnit> {
    return new CommodityUnit({
      ...values,
      status: CommodityUnitStatus.ACTIVE,
    });
  }

  public async buildCommodityUnitSystem(
    values: Pick<CommodityUnit, 'code'>,
  ): Promise<CommodityUnit> {
    return CommodityUnitFactory.buildCommodityUnit(
      new CommodityUnit({
        ...values,
        area: CommodityUnitArea.SYSTEM,
      }),
    );
  }

  public async buildCommodityUnitWarehouse(
    values: Pick<CommodityUnit, 'code'>,
  ): Promise<CommodityUnit> {
    return CommodityUnitFactory.buildCommodityUnit(
      new CommodityUnit({
        ...values,
        area: CommodityUnitArea.WAREHOUSE,
      }),
    );
  }
}
