import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarBodyType } from '../entities/car-body-type.entity';
import { CarBrand } from '../entities/car-brand.entity';
import { CarEngine } from '../entities/car-engine.entity';
import { CarFuelType } from '../entities/car-fuel-type.entity';
import { CarMarketprice } from '../entities/car-marketprice.entity';
import { CarModel } from '../entities/car-model.entity';
import { CarSubModel } from '../entities/car-sub-model.entity';
import { CarYear } from '../entities/car-year.entity';
import * as carModels from './data/car-models.json';
import * as carModelLifestyles from './data/car-model-lifestyles.json';
import { CarLifestyle } from '../entities/car-lifestyle.entity';
import { isEmpty } from 'lodash';

export default class CarModelSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carSubModelRepository = dataSource.getRepository(CarSubModel);
    const carModelRepository = dataSource.getRepository(CarModel);
    const carBrandRepository = dataSource.getRepository(CarBrand);
    const carYearRepository = dataSource.getRepository(CarYear);
    const carFuelTypeRepository = dataSource.getRepository(CarFuelType);
    const carBodyTypeRepository = dataSource.getRepository(CarBodyType);
    const carEngineRepository = dataSource.getRepository(CarEngine);
    const carMarketPriceRepository = dataSource.getRepository(CarMarketprice);
    const carLifestyleRepository = dataSource.getRepository(CarLifestyle);

    for (const [carModel, carModelDetails] of Object.entries(carModels)) {
      let brand = await carBrandRepository.findOne({
        where: {
          name: carModelDetails.brand,
        },
      });

      if (!brand) {
        brand = carBrandRepository.create({
          name: carModelDetails.brand,
        });
        await carBrandRepository.save(brand);
      }

      let model = await carModelRepository.findOne({
        where: {
          name: carModel,
        },
      });

      if (!model) {
        model = carModelRepository.create({
          name: carModel,
          brand: brand,
          lifestyles: [{ name: 'Others' }],
        });
        await carModelRepository.save(model);
      }

      for (const [carSubModel, carSubModelDetails] of Object.entries(
        carModelDetails.subModels,
      )) {
        const foundCarSubModel = await carSubModelRepository.findOne({
          where: {
            name: carSubModel,
          },
        });

        if (!foundCarSubModel) {
          const newCarSubModel = carSubModelRepository.create({
            name: carSubModel,
            model: model,
          });

          const years = await carYearRepository.find({
            where: { name: In(carSubModelDetails['years']) },
          });
          newCarSubModel.years = years;

          const fuelTypes = await carFuelTypeRepository.find({
            where: { name: In(carSubModelDetails['fuelTypes']) },
          });
          newCarSubModel.fuelTypes = fuelTypes;

          const bodyTypes = await carBodyTypeRepository.find({
            where: { name: In(carSubModelDetails['bodyTypes']) },
          });
          newCarSubModel.bodyTypes = bodyTypes;

          const engines = await carEngineRepository.find({
            where: { name: In(carSubModelDetails['engines']) },
          });
          newCarSubModel.engines = engines;

          const marketPrices = [];
          for (const marketPrice of carSubModelDetails['marketPrices']) {
            const marketPriceDb = carMarketPriceRepository.create({
              manufacturedYear: marketPrice.manufacturedYear,
              price: marketPrice.price,
            });

            marketPrices.push(marketPriceDb);
          }

          newCarSubModel.marketprices = marketPrices;

          await carSubModelRepository.save(newCarSubModel);
        }
      }
    }

    await this.seedModelLifestyles(dataSource);
  }

  private async seedModelLifestyles(dataSource: DataSource) {
    const carModelRepository = dataSource.getRepository(CarModel);

    for (const carModelLifestyle of carModelLifestyles) {
      const foundCarModelLifestyle = await carModelRepository.findOne({
        where: { name: carModelLifestyle.modelName },
      });

      const lifestyles = [];
      if (foundCarModelLifestyle) {
        const lifestyle = carModelRepository.create({
          name: carModelLifestyle.lifestyleName,
        });

        lifestyles.push(lifestyle);

        foundCarModelLifestyle.lifestyles = lifestyles;
        await carModelRepository.save(foundCarModelLifestyle);
      }
    }
  }
}
