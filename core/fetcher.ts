
import * as tls from 'node:tls';
import type { TFetchContext, TFetchOptions, TRequest } from './types';
import { getRandomElements, shuffle } from './utils';

export type TFetcherOptions = {
  proxyUrl?: string;
  retryableStatusCodes?: Set<number>;
  nullBodyResponses?: Set<number>;
  methodsWithPayload?: Set<string>;
}

export class Fetcher {
  proxyUrl?: string;
  defaultRetryableStatusCodes: Set<number>;
  defaultNullBodyResponses: Set<number>;
  defaultMethodsWithPayload: Set<string>;

  constructor(options?: TFetcherOptions) {
    this.proxyUrl = options?.proxyUrl;

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    this.defaultRetryableStatusCodes = options?.retryableStatusCodes || new Set([
      408, // Request Timeout
      409, // Conflict
      425, // Too Early
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ]);

    // https://developer.mozilla.org/en-US/docs/Web/API/Response/body
    this.defaultNullBodyResponses = options?.nullBodyResponses || new Set([101, 204, 205, 304]);

    this.defaultMethodsWithPayload = options?.methodsWithPayload || new Set(["PATCH", "POST", "PUT", "DELETE"]);
  }

  // static patchTls() {
  //   Object.assign(tls, {
  //     DEFAULT_CIPHERS: Fetcher.getRandomCiphers(),
  //     DEFAULT_MIN_VERSION: 'TLSv1.2',
  //     DEFAULT_MAX_VERSION: 'TLSv1.3',
  //   });
  // }

  static create(options?: TFetcherOptions) {
    return new Fetcher(options);
  }

  async fetch(request: TRequest, options: TFetchOptions) {

    const ctx: TFetchContext = {
      request: new Request(request),
      options,
      response: undefined,
      error: undefined,
    };

    let abortTimeout: NodeJS.Timeout | undefined;

    if (!options.signal && options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(
        () => controller.abort(),
        options.timeout
      ) as NodeJS.Timeout;
      options.signal = controller.signal;
    }

    try {
      ctx.response = await fetch(ctx.request, {
        ...options,
        keepalive: false,
        proxy: this.proxyUrl,
        signal: options.signal,
        tls: {
          rejectUnauthorized: false,
        }
      } as ResponseInit)
    } catch (error) {
      ctx.error = error as Error;
      // if (context.options.onRequestError) {
      //   await context.options.onRequestError(context as any);
      // }
      // return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }


    // follow here
    // https://github.com/unjs/ofetch/blob/main/src/fetch.ts
  }

  isPayloadMethod(method = "GET") {
    return this.defaultMethodsWithPayload.has(method.toUpperCase());
  }

  isJSONSerializable(value: any) {
    if (value === undefined) {
      return false;
    }
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean" || t === null) {
      return true;
    }
    if (t !== "object") {
      return false; // bigint, function, symbol, undefined
    }
    if (Array.isArray(value)) {
      return true;
    }
    if (value.buffer) {
      return false;
    }
    return (
      (value.constructor && value.constructor.name === "Object") ||
      typeof value.toJSON === "function"
    );
  }

  static getDefaultCiphers() {
    try {
      return (tls as unknown as { DEFAULT_CIPHERS: string }).DEFAULT_CIPHERS.split(':');
    } catch (error: any) {
      return [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'DHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES256-SHA256',
        'HIGH',
      ];
    }
  }

  static getRandomCiphers() {
    const defaultCiphers = Fetcher.getDefaultCiphers();
    const ciphersRest = shuffle([
      ...getRandomElements(defaultCiphers.slice(3)),
      ...getRandomElements(defaultCiphers.slice(3)),
      ...getRandomElements(defaultCiphers.slice(3)),
      ...getRandomElements(defaultCiphers.slice(3)),
    ]);

    const shuffledCiphers = [
      // Chrome-like first ciphers
      defaultCiphers[1],
      defaultCiphers[2],
      defaultCiphers[0],
      // Random ciphers
      ...ciphersRest,
    ];

    return shuffledCiphers.join(':');
  }
}

// Fetcher.patchTls();