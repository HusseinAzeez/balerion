import { Module } from '@nestjs/common';
import { SaveCarsService } from './save-cars.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaveCar } from '@/db/entities/save-car.entity';
import { Car } from '@/db/entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car, SaveCar])],
  providers: [SaveCarsService],
  exports: [SaveCarsService],
})
export class SaveCarsModule {}
