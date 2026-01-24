import { Controller, All, Req, Body } from '@nestjs/common';
import { EsploraService } from './esplora.service';
import type { Request } from 'express';

@Controller('esplora')
export class EsploraController {
  constructor(private readonly esploraService: EsploraService) {}

  @All('*path')
  async proxy(@Req() req: Request, @Body() body: any) {
    // Extract the path relative to /esplora
    // req.originalUrl includes the full path e.g. /esplora/fee-estimates
    // We want /fee-estimates
    // However, if the app sends /esplora/fee-estimates, we essentially want the part AFTER /esplora

    // Quick fix: Remove /esplora prefix
    const relativePath = req.originalUrl.replace(/^\/esplora/, '');
    const method = req.method as 'GET' | 'POST';

    return this.esploraService.proxyRequest(method, relativePath, body);
  }
}
