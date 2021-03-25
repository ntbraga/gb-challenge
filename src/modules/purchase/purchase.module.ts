import { PurchaseController } from './controllers/purchase/purchase.controller';
import { PurchaseService } from './services/purchase/purchase.service';
import { Purchase } from './../../data/entities/Purchase.entity';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer, Purchase])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
