import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EsploraService } from './esplora.service';
import { EsploraController } from './esplora.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [EsploraController],
  providers: [EsploraService],
})
export class EsploraModule {}
