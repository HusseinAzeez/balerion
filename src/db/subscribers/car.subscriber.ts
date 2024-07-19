import {
  DataSource,
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { padStart } from 'lodash';
import { Car } from '../entities/car.entity';
import { MonthlyInstallment } from '../entities/monthly-installment.entity';
import { calculateMonthlyInstallment } from '@/common/helpers/car.helper';

@EventSubscriber()
export class CarSubscriber implements EntitySubscriberInterface<Car> {
  constructor(dataSource: DataSource) {
    if (dataSource) dataSource.subscribers.push(this);
  }

  listenTo() {
    return Car;
  }

  async beforeInsert({ manager, entity }: InsertEvent<Car>) {
    entity.uid = await this.generateUid(manager, entity);

    if (entity.registeredYear) {
      entity.monthlyInstallment = await this.generateMonthlyInstallment(
        manager,
        entity.registeredYear,
        entity.bodyTypeName,
        entity.price,
        entity.discount,
      );
    }
  }

  async beforeUpdate({ manager, entity, databaseEntity }: UpdateEvent<Car>) {
    if (entity.registeredYear) {
      if (
        entity.registeredYear !== databaseEntity.registeredYear ||
        entity.price !== databaseEntity.price ||
        entity.bodyTypeName !== databaseEntity.bodyTypeName
      ) {
        entity.monthlyInstallment = await this.generateMonthlyInstallment(
          manager,
          entity.registeredYear,
          entity.bodyTypeName,
          entity.price,
          entity.discount,
        );
      }
    }
  }

  private async generateMonthlyInstallment(
    manager: EntityManager,
    registeredYear: number,
    bodyTypeName: string,
    price: number,
    discount: number,
  ): Promise<number> {
    const monthlyInstallmentRepository =
      manager.getRepository(MonthlyInstallment);

    // NOTE(Hussein): We have only interest rates for Sedan & Pickup body types
    // Use Sedan interest rates for every car that isn't of Sedan body type.

    if (bodyTypeName !== 'Pickup') {
      bodyTypeName = 'Sedan';
    }

    const maximumLoanTerm = await monthlyInstallmentRepository.findOne({
      where: {
        year: registeredYear,
        bodyType: { name: bodyTypeName },
      },
      order: { loanTerm: 'DESC' },
    });

    if (!maximumLoanTerm) {
      return 0;
    }

    const downPayment = 0;

    return calculateMonthlyInstallment(
      price,
      discount,
      downPayment,
      maximumLoanTerm.loanTerm,
      maximumLoanTerm.interestRate,
    );
  }

  private async generateUid(manager: EntityManager, entity: Car) {
    const carRepository = manager.getRepository(Car);

    // NOTE(Hussein): Car's UID format is:
    // 1st digit: I/A/D/V:  Individual(private)/Agent/Dealer/Vendor
    // 2nd-7th Digit: Consecutive number that identifies user (example: 902374) (start from 000001 for each user type)
    // 8th-9th: Brand initials (example: TO for Toyota)
    // 10th-11th: Province initials (example: BA for Bangkok)
    // 12th: P/D/E: Petrol/Diesel/Electric
    // 13th-15th: Consecutive number for the post made by that user (example, 049 for the post number 49), once reached 999, comes back to 000
    const latestCar = await carRepository
      .createQueryBuilder('car')
      .select('SUBSTRING(car.uid, 13, 15)', 'seq')
      .innerJoin('car.user', 'user')
      .where('user.id = :userId', { userId: entity.user.id })
      .orderBy('seq', 'DESC')
      .withDeleted()
      .getRawOne();

    const userPrefix = entity.user.uid;
    const brandPrefix = entity.brand.name.slice(0, 2).toUpperCase();
    const fuelTypePerfix = entity.fuelType.name.slice(0, 1).toUpperCase();
    const provincePrefix = entity.province.slice(0, 2).toUpperCase();

    const prefix = `${userPrefix}${brandPrefix}${provincePrefix}${fuelTypePerfix}`;

    if (latestCar) {
      const latestUid = parseInt(latestCar.seq);

      // Rest the user's post count once it reaches 999.
      if (latestUid === 999) {
        return `${prefix}001`;
      } else {
        const newUid = padStart(String(latestUid + 1), 3, '0');
        return `${prefix}${newUid}`;
      }
    } else {
      return `${prefix}001`;
    }
  }
}
