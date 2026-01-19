import { Controller } from '@nestjs/common';
import { EsploraService } from './esplora.service';

@Controller('esplora')
export class EsploraController {
  constructor(private readonly esploraService: EsploraService) {}
}
