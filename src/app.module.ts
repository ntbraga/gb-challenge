import { CashbackModule } from './modules/cashback/cashback.module';
import { Purchase } from './data/entities/Purchase.entity';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { DealerModule } from './modules/dealer/dealer.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { config as configDotEnv } from 'dotenv-safe';

configDotEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URL,
      database: process.env.DB_NAME,
      logging: false,
      useUnifiedTopology: true,
      synchronize: true,
      entities: [Dealer, Purchase],
    }),
    AuthModule,
    DealerModule,
    PurchaseModule,
    CashbackModule,
  ],
})
export class AppModule {}
