import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
