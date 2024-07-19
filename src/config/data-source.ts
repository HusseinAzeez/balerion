import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import entities from '@/db/entities';
import configuration from '@/config/configuration';

const config = configuration();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: entities,
  ssl: process.env.MODE === 'production',
  logging: process.env.MODE === 'development',
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  subscribers: ['dist/db/subscribers/*{.ts,.js}'],

  // SeederOptions
  factories: ['dist/db/factories/*{.ts,.js}'],
  seeds: ['dist/db/seeds/*{.ts,.js}'],
};

export const PostgresDataSource = new DataSource(options);
