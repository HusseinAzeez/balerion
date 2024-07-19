import { MonthlyInstallmentLoanTerm } from '@/common/enums/monthly-installment.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarBodyType } from '../entities/car-body-type.entity';
import { MonthlyInstallment } from '../entities/monthly-installment.entity';

import * as monthlyInstallments from './data/monthly-installments.json';

export default class MonthlyInstallmentSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carBodyTypeRepository = dataSource.getRepository(CarBodyType);
    const monthlyInstallmentRepository =
      dataSource.getRepository(MonthlyInstallment);

    for (const monthlyInstallment of monthlyInstallments) {
      const foundMonthlyInstallment =
        await monthlyInstallmentRepository.findOne({
          where: {
            year: monthlyInstallment.year,
            loanTerm: monthlyInstallment.loadTerm as MonthlyInstallmentLoanTerm,
            bodyType: { name: monthlyInstallment.bodyType },
          },
        });

      if (!foundMonthlyInstallment) {
        const bodyType = await carBodyTypeRepository.findOne({
          where: { name: monthlyInstallment.bodyType },
        });

        const newMonthlyInstallment = monthlyInstallmentRepository.create({
          year: monthlyInstallment.year,
          loanTerm: monthlyInstallment.loadTerm as MonthlyInstallmentLoanTerm,
          interestRate: monthlyInstallment.interestRate,
          bodyType: bodyType,
        });
        await monthlyInstallmentRepository.save(newMonthlyInstallment);
      }
    }
  }
}
