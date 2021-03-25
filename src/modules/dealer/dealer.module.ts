import { Dealer } from 'src/data/entities/Dealer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerService } from './services/dealer/dealer.service';
import { DealerController } from './controllers/dealer/dealer.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [DealerController],
  providers: [DealerService],
})
export class DealerModule {}
