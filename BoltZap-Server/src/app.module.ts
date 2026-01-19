import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EsploraModule } from './esplora/esplora.module';

@Module({
  imports: [EsploraModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
