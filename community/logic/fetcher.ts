
import * as tls from 'node:tls';
import type { TFetchContext, TFetchOptions } from '../models/fetch-context';
import { HttpMethod } from '../models/http-method';
import { HttpStatusCode } from '../models/http-status-code';
import type { TRequest } from '../models/request';
import type { TResponse, TResponseType } from '../models/response';
import { getRandomElements, shuffle } from './utils';

export type TFetcherOptions = {
  proxyUrl?: string;
  retryableStatusCodes?: Set<number>;
  nullBodyResponses?: Set<number>;
  methodsWithPayload?: Set<string>;
}

export class Fetcher {
  static patchedTls = false;

  proxyUrl?: string;
  defaultRetryableStatusCodes: Set<number>;
  defaultNullBodyResponses: Set<number>;
  defaultMethodsWithPayload: Set<string>;

  constructor(options?: TFetcherOptions) {
    Fetcher.patchTls();
    this.proxyUrl = options?.proxyUrl;
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    this.defaultRetryableStatusCodes = options?.retryableStatusCodes || new Set([
      HttpStatusCode.RequestTimeout,
      HttpStatusCode.Conflict,
      HttpStatusCode.TooEarly,
      HttpStatusCode.TooManyRequests,
      HttpStatusCode.InternalServerError,
      HttpStatusCode.BadGateway,
      HttpStatusCode.ServiceUnavailable,
      HttpStatusCode.GatewayTimeout,
    ]);
    // https://developer.mozilla.org/en-US/docs/Web/API/Response/body
    this.defaultNullBodyResponses = options?.nullBodyResponses || new Set([
      HttpStatusCode.SwitchingProtocols,
      HttpStatusCode.NoContent,
      HttpStatusCode.ResetContent,
      HttpStatusCode.NotModified
    ]);

    this.defaultMethodsWithPayload = options?.methodsWithPayload || new Set([
      HttpMethod.PATCH,
      HttpMethod.POST,
      HttpMethod.PUT,
      HttpMethod.DELETE
    ]);
  }

  static patchTls() {
    if (Fetcher.patchedTls) return;
    Fetcher.patchedTls = true;

    // Object.defineProperty(tls, 'DEFAULT_CIPHERS', {
    //   value: Fetcher.getRandomCiphers(),
    //   writable: true,
    //   configurable: true,
    // });

    // Object.defineProperty(tls, 'DEFAULT_MIN_VERSION', {
    //   value: 'TLSv1.2',
    //   writable: true,
    //   configurable: true,
    // });

    // Object.defineProperty(tls, 'DEFAULT_MAX_VERSION', {
    //   value: 'TLSv1.3',
    //   writable: true,
    //   configurable: true,
    // });
  }

  static create(options?: TFetcherOptions) {
    return new Fetcher(options);
  }

  async fetch(request: TRequest, options?: TFetchOptions): Promise<TResponse | undefined> {

    const context: TFetchContext = {
      // request: new Request(request),
      request,
      options: options || {},
      response: undefined,
      error: undefined,
    };

    let abortTimeout: NodeJS.Timeout | undefined;

    if (!options?.signal && options?.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(
        () => controller.abort(),
        options.timeout
      ) as NodeJS.Timeout;
      options.signal = controller.signal;
    }

    try {
      const response = await fetch(context.request.url, {
        ...options,
        ...context.request,
        keepalive: false,
        proxy: this.proxyUrl,
        signal: options?.signal,
        tls: {
          rejectUnauthorized: false,
        }
      });

      context.response = {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.body,
      };

      const hasBody = context.response.body && !this.defaultNullBodyResponses.has(response.status) && context.options.method !== HttpMethod.HEAD;
      if (hasBody) {
        const responseType = this.detectResponseType(response.headers.get("content-type") || "");

        // We override the `.json()` method to parse the body more securely with `destr`
        switch (responseType) {
          case "json": {
            context.response.data = await response.text();
            break;
          }
          case "stream": {
            context.response.data = response.body;
            break;
          }
          default: {
            context.response.data = await response[responseType]();
          }
        }
      }

    } catch (error) {
      context.error = error as Error;
      console.error(error);
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

    return context.response;
  }

  isPayloadMethod(method = HttpMethod.GET) {
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

  detectResponseType(_contentType = ""): TResponseType {
    if (!_contentType) {
      return "json";
    }

    // Value might look like: `application/json; charset=utf-8`
    const contentType = _contentType.split(";").shift() || "";

    if (/^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i.test(contentType)) {
      return "json";
    }

    // TODO
    // if (contentType === 'application/octet-stream') {
    //   return 'stream'
    // }

    if (new Set([
      "image/svg",
      "application/xml",
      "application/xhtml",
      "application/html",
    ]).has(contentType) || contentType.startsWith("text/")) {
      return "text";
    }

    return "blob";
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