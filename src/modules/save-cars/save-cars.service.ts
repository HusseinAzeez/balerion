import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaveCarDto } from './dto/create-save-car.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveCar } from '@/db/entities/save-car.entity';
import { Repository } from 'typeorm';
import { RemoveSaveCarDto } from './dto/remove-save-car.dto';
import { Car } from '@/db/entities/car.entity';

@Injectable()
export class SaveCarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(SaveCar)
    private readonly saveCarRepository: Repository<SaveCar>,
  ) {}

  async create(createSaveCarDto: CreateSaveCarDto, currentUserId: number) {
    const { carId } = createSaveCarDto;
    await this.findCar(carId);

    const saveCar = await this.saveCarRepository.findOne({
      where: { userId: currentUserId, carId: carId },
    });
    if (saveCar)
      throw new BadRequestException(
        `User ${currentUserId} already save car ${carId}.`,
      );

    return this.saveCarRepository.save(
      this.saveCarRepository.create({
        userId: currentUserId,
        carId,
      }),
    );
  }

  async remove(removeSaveCarDto: RemoveSaveCarDto, currentUserId: number) {
    const { carId } = removeSaveCarDto;
    await this.findCar(carId);
    const saveCar = await this.saveCarRepository.findOne({
      where: { userId: currentUserId, carId },
    });
    if (!saveCar)
      throw new NotFoundException(
        `User ${currentUserId} never save car ${carId}.`,
      );

    return this.saveCarRepository.remove(saveCar);
  }

  private async findCar(id: number) {
    const car = await this.carRepository.findOne({
      where: { id },
      select: ['id'],
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }
  }
}
