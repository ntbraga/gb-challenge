import { Purchase } from 'src/data/entities/Purchase.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { MongoExceptionFilter } from 'src/filters/mongo-exception.filter';
export const TypeormForTest = () => {
  return TypeOrmModule.forRoot({
    type: 'mongodb',
    url: process.env.DB_URL,
    database: process.env.TEST_DB_NAME,
    logging: false,
    useUnifiedTopology: true,
    entities: [Dealer, Purchase],
  });
};

export const applyGlobalToApp = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new MongoExceptionFilter());
};
