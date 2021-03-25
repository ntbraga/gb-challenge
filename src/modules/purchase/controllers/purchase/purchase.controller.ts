import {
  CreatePurchaseDTO,
  UpdatePurchaseDTO,
} from './../../../../data/dto/Purchase.dto';
import { PurchaseService } from './../../services/purchase/purchase.service';
import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  HttpCode,
  Put,
  Delete,
  Param,
  Get,
} from '@nestjs/common';

@Controller('purchases')
export class PurchaseController {
  constructor(
    @Inject(PurchaseService) private purchaseService: PurchaseService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePurchaseDTO) {
    return this.purchaseService.create(createDto);
  }

  @Put()
  async update(@Body() updateDto: UpdatePurchaseDTO) {
    return this.purchaseService.update(updateDto);
  }

  @Delete('/:cpf/:cod')
  async remove(@Param('cpf') cpf: string, @Param('cod') cod: string) {
    return this.purchaseService.remove(cpf, cod);
  }

  @Get('/:cpf')
  async findAll(@Param('cpf') cpf: string) {
    return this.purchaseService.findAll(cpf);
  }
}
