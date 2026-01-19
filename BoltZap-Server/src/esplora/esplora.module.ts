import { Module } from '@nestjs/common';
import { EsploraService } from './esplora.service';
import { EsploraController } from './esplora.controller';

@Module({
  controllers: [EsploraController],
  providers: [EsploraService],
})
export class EsploraModule {}
