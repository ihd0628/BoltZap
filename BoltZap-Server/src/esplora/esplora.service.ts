import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// 캐시 항목 타입
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// TTL 설정 (초 단위)
const TTL_CONFIG = {
  FEE_ESTIMATES: 60, // 60초
  BLOCKS_TIP: 30, // 30초
  BLOCK_DATA: 86400, // 24시간 (불변 데이터)
};

@Injectable()
export class EsploraService {
  private readonly logger = new Logger(EsploraService.name);

  // 메모리 캐시
  private readonly cache = new Map<string, CacheEntry>();

  // Priority list of Esplora instances
  // NOTE: mempool.space가 현재 네트워크에서 연결 불가하여 blockstream.info를 1순위로 사용
  private readonly instances = [
    'https://blockstream.info/api',
    'https://mempool.space/api', // fallback
  ];

  constructor(private readonly httpService: HttpService) {}

  /**
   * URL 패턴에 따라 적절한 TTL 반환
   * scripthash는 캐싱하지 않음 (null 반환)
   */
  private getTtlForUrl(url: string): number | null {
    // scripthash는 캐싱하지 않음 (새 트랜잭션 반영 지연 방지)
    if (url.includes('/scripthash/')) {
      return null;
    }

    // fee-estimates: 60초 캐싱
    if (url.includes('/fee-estimates')) {
      return TTL_CONFIG.FEE_ESTIMATES;
    }

    // blocks/tip/*: 30초 캐싱
    if (url.includes('/blocks/tip/')) {
      return TTL_CONFIG.BLOCKS_TIP;
    }

    // block/{hash}/header, block/{hash}/status: 24시간 캐싱 (불변 데이터)
    if (url.match(/\/block\/[a-f0-9]+\/(header|status)/)) {
      return TTL_CONFIG.BLOCK_DATA;
    }

    // 기타 요청은 캐싱하지 않음
    return null;
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  private getFromCache(key: string): unknown {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  private setToCache(key: string, data: unknown, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async proxyRequest(
    method: 'GET' | 'POST',
    url: string,
    data?: unknown,
  ): Promise<unknown> {
    // POST 요청은 캐싱하지 않음
    const ttl = method === 'GET' ? this.getTtlForUrl(url) : null;
    const cacheKey = `${method}:${url}`;

    // 캐시 확인 (GET 요청이고 TTL이 설정된 경우만)
    if (ttl !== null) {
      const cached = this.getFromCache(cacheKey);
      if (cached !== null) {
        this.logger.debug(`[CACHE HIT] ${url}`);
        return cached;
      }
      this.logger.debug(`[CACHE MISS] ${url}`);
    }

    let lastError: Error | null = null;

    for (const instance of this.instances) {
      try {
        const fullUrl = `${instance}${url}`;
        this.logger.debug(`Proxying ${method} ${fullUrl}`);

        const response = await lastValueFrom(
          this.httpService.request({
            method,
            url: fullUrl,
            data,
            headers: {
              // Mimic a real browser to avoid bot filtering
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          }),
        );

        // 성공 시 캐시에 저장
        if (ttl !== null) {
          this.setToCache(cacheKey, response.data, ttl);
          this.logger.debug(`[CACHE SET] ${url} (TTL: ${ttl}s)`);
        }

        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;
        const status = axiosError?.response?.status;
        const message = axiosError?.message;
        this.logger.warn(
          `Failed to fetch from ${instance}${url}: ${status ?? 'No Status'} - ${message}`,
        );

        // 상세 에러 로깅 (디버깅용)
        if (axiosError?.response?.data) {
          this.logger.debug(JSON.stringify(axiosError.response.data));
        } else {
          // 데이터가 없으면 스택 트레이스라도 찍어서 원인 파악 (타임아웃인지 DNS인지 등)
          this.logger.debug(lastError.stack);
        }

        // If rate limited (429) or server error (5xx), try next instance.
        continue;
      }
    }

    this.logger.error('All Esplora instances failed');
    throw lastError;
  }
}
