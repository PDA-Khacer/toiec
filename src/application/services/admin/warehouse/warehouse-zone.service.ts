import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  AccountRepository,
  WarehouseZoneRepository,
  WarehouseRepository,
} from '../../../../infrastructure/repositories';
import {service} from '@loopback/core';
import {Account} from '../../../../domain/models/account.model';
import {HttpErrors} from '@loopback/rest';
import {WarehouseZoneFactoryService} from '../../../../domain/services/warehouse/warehouse-zone-factory.service';
import {
  WarehouseZone,
  WarehouseZoneStatus,
  WarehouseZoneType,
} from '../../../../domain/models/warehouse/warehouse-zone.model';

@bind()
export class WarehouseZoneService {
  constructor(
    @repository(WarehouseRepository)
    private warehouseRepository: WarehouseRepository,

    @repository(WarehouseZoneRepository)
    private warehouseZoneRepository: WarehouseZoneRepository,

    @repository(AccountRepository)
    private accountRepository: AccountRepository,

    @service(WarehouseZoneFactoryService)
    private warehouseFactory: WarehouseZoneFactoryService,
  ) {}

  public async createWarehouseZone(
    idSelf: number,
    values: Omit<WarehouseZone, 'id'>,
  ): Promise<boolean> {
    // check
    const self = await this.getSelf(idSelf);

    // create
    let warehouseZone: WarehouseZone;
    switch (values.warehouseType) {
      case WarehouseZoneType.DEFAULT:
        warehouseZone = await this.warehouseFactory.buildWarehouseZoneDefault(
          values,
        );
        break;
      case WarehouseZoneType.HEAD:
        warehouseZone = await this.warehouseFactory.buildWarehouseZoneHead(
          values,
        );
        break;
      case WarehouseZoneType.MIDDLE:
        warehouseZone = await this.warehouseFactory.buildWarehouseZoneMiddle(
          values,
        );
        break;
      case WarehouseZoneType.TAIL:
        warehouseZone = await this.warehouseFactory.buildWarehouseZoneTail(
          values,
        );
        break;
      case WarehouseZoneType.PACKING:
        warehouseZone = await this.warehouseFactory.buildWarehouseZonePacking(
          values,
        );
        break;
      case WarehouseZoneType.SHIPPING:
        warehouseZone = await this.warehouseFactory.buildWarehouseZoneShipping(
          values,
        );
        break;
      case WarehouseZoneType.SHIPPING_PACKING:
        warehouseZone = await this.warehouseFactory.buildWarehouseZonePacking(
          values,
        );
        break;
      case WarehouseZoneType.WAITING_GOODS:
        warehouseZone =
          await this.warehouseFactory.buildWarehouseZoneWaitingGoods(values);
        break;
    }

    await this.checkRequire(warehouseZone);

    const {result, msg} = await this.checkingZoneValidated(
      warehouseZone.coordinates,
      warehouseZone.x,
      warehouseZone.y,
      Number(warehouseZone.capacity),
      values.idWarehouse,
    );

    if (!result) {
      throw new HttpErrors.BadRequest(msg);
    }

    warehouseZone.whoCreate = self.id.toString();
    await this.warehouseZoneRepository.create(warehouseZone);
    return true;
  }

  public async getById(
    idSelf: number,
    idWarehouseZone: number,
  ): Promise<WarehouseZone> {
    // check
    await this.getSelf(idSelf);
    if (!(await this.checkLockWarehouseZone(idSelf, idWarehouseZone))) {
      return this.warehouseZoneRepository
        .findById(idWarehouseZone)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('msgNotFoundWarehouseZone');
        });
    }
    throw new HttpErrors.BadRequest('msgDataBeLock');
  }

  public async get(
    idSelf: number,
    filter?: Filter<WarehouseZone>,
  ): Promise<Array<WarehouseZone>> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseZoneRepository.find(filter);
  }

  public async getWithWarehouse(
    idSelf: number,
    idWarehouse: string,
  ): Promise<Array<WarehouseZone>> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseZoneRepository.find({
      where: {idWarehouse: idWarehouse},
    });
  }

  public async count(
    idSelf: number,
    where?: Where<WarehouseZone>,
  ): Promise<Count> {
    // check
    await this.getSelf(idSelf);
    return this.warehouseZoneRepository.count(where);
  }

  public async updateWarehouseZone(
    idSelf: number,
    idWarehouseZone: number,
    value: WarehouseZone,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockWarehouseZone(idSelf, idWarehouseZone, true)) {
      await this.warehouseZoneRepository
        .updateById(idWarehouseZone, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockWarehouseZone(idSelf, idWarehouseZone, false);
        });
      return true;
    }
    return false;
  }

  public async updateStatusWarehouseZone(
    idSelf: number,
    idWarehouseZone: number,
    status: WarehouseZoneStatus,
  ) {
    // check
    await this.getSelf(idSelf);
    // lock
    if (await this.lockWarehouseZone(idSelf, idWarehouseZone, true)) {
      const value = await this.warehouseZoneRepository
        .findById(idWarehouseZone)
        .catch(reason => {
          console.log(reason);
          throw new HttpErrors.NotFound('mgsNotFoundWarehouseZone');
        });
      value.status = status;
      await this.warehouseZoneRepository
        .updateById(idWarehouseZone, value)
        .finally(async () => {
          // unlock warehouse
          await this.lockWarehouseZone(idSelf, idWarehouseZone, false);
        });
      return true;
    }
    return false;
  }

  public async checkLockWarehouseZone(
    idSelf: number,
    idWarehouseZone: number,
  ): Promise<boolean> {
    // check
    await this.getSelf(idSelf);
    // get lock
    const warehouseZone = await this.warehouseZoneRepository
      .findById(idWarehouseZone)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouseZone');
      });
    return warehouseZone.isLocked;
  }

  public async getAllZoneOfWarehouse(
    idSelf: number,
    idWarehouseZone: number,
    type: 'all' | WarehouseZoneType,
  ): Promise<Array<WarehouseZone>> {
    // check
    await this.getSelf(idSelf);
    //
    let zones = null;
    switch (type) {
      case 'all':
        zones = await this.warehouseZoneRepository.find({
          where: {idWarehouse: String(idWarehouseZone)},
        });
        break;
      default:
        zones = await this.warehouseZoneRepository.find({
          where: {idWarehouse: String(idWarehouseZone), warehouseType: type},
        });
        break;
    }
    return zones;
  }

  private async lockWarehouseZone(
    idSelf: number,
    idWarehouseZone: number,
    beLock: boolean,
  ): Promise<boolean> {
    const warehouseZone = await this.warehouseZoneRepository
      .findById(idWarehouseZone)
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouseZone');
      });

    if (warehouseZone.isLocked) {
      throw new HttpErrors.BadRequest('mgsWarehouseZoneLocked');
    } else {
      if (beLock) {
        warehouseZone.isLocked = true;
        warehouseZone.whoLocked = String(idSelf);
        warehouseZone.lockedAt = new Date();
      } else {
        warehouseZone.isLocked = false;
      }
      await this.warehouseZoneRepository.updateById(
        idWarehouseZone,
        warehouseZone,
      );
      return true;
    }
  }

  private async checkRequire(value: WarehouseZone): Promise<boolean> {
    await this.warehouseRepository
      .findById(Number(value.idWarehouse))
      .catch(reason => {
        console.log(reason);
        throw new HttpErrors.NotFound('mgsNotFoundWarehouse');
      });

    return true;
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

  private async checkingZoneValidated(
    coordinates: string,
    length: string,
    width: string,
    capacity: number,
    idWarehouse: string,
  ): Promise<{result: boolean; msg: string}> {
    const warehouse = await this.warehouseRepository
      .findById(Number(idWarehouse))
      .catch(reason => {
        console.log(reason.toString());
        throw new HttpErrors.NotFound('msgNotFoundWarehouse');
      });

    const {x, y} = JSON.parse(coordinates); // zone created
    if (x > Number(warehouse.x) || y > Number(warehouse.y)) {
      return {result: false, msg: 'msgNotInWarehouse'};
    }

    if (
      x + Number(length) > Number(warehouse.x) ||
      y + Number(width) > Number(warehouse.y)
    ) {
      return {result: false, msg: 'msgOutBoundary'};
    }

    const zones = await this.warehouseZoneRepository.find({
      where: {idWarehouse: idWarehouse},
    });
    let occupiedCapacity = 0;

    for (const zone of zones) {
      occupiedCapacity += Number(zone.capacity);
      const cdZone: {x: number; y: number} = JSON.parse(zone.coordinates);

      let lb1 = {x: 0, y: 0}; // left bottom
      let tr1 = {x: 0, y: 0}; // top right
      let lb2 = {x: 0, y: 0}; // left bottom
      // let tr2 = {x: 0, y: 0}; // top right

      if (x > cdZone.x) {
        lb1 = {x: cdZone.x, y: cdZone.y};
        tr1 = {x: cdZone.x + Number(zone.x), y: cdZone.y + Number(zone.y)};
        lb2 = {x: x, y: y};
        // tr2 = {x: x + Number(length), y: y + Number(width)};
      } else {
        lb1 = {x: x, y: y};
        tr1 = {x: x + Number(length), y: y + Number(width)};
        lb2 = {x: cdZone.x, y: cdZone.y};
        // tr2 = {x: cdZone.x + Number(zone.x), y: cdZone.y + Number(zone.y)};
      }

      // console.log(lb1);
      // console.log(tr1);
      // console.log(lb2);
      // console.log(tr2);

      if (lb1.x <= lb2.x && lb2.x < tr1.x && lb1.y <= lb2.y && lb2.y < tr1.y) {
        return {result: false, msg: 'msgZoneOccupied'};
      }

      // if (
      //   (cdZone.x <= x && x < cdZone.x + Number(zone.x)) ||
      //   (cdZone.y <= y && y < cdZone.y + Number(zone.y))
      // ) {
      //   return {result: false, msg: 'msgZoneOccupied'};
      // }
    }

    // checking
    if (capacity > Number(warehouse.capacity) - occupiedCapacity) {
      return {result: false, msg: 'msgNotFit'};
    }

    return {result: true, msg: ''};
  }
}
