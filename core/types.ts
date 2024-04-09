import type { RequestInfo } from 'undici';

export interface TResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type TResponseType = keyof TResponseMap | "json";

export type TRequest = RequestInfo;
export interface TResponse<T> extends Response {
  _data?: T;
}

export interface TFetchOptions<R extends TResponseType = TResponseType> extends Omit<RequestInit, "body"> {
  baseURL?: string;
  body?: RequestInit["body"] | Record<string, any>;
  ignoreResponseError?: boolean;
  params?: Record<string, any>;
  query?: Record<string, any>;
  parseResponse?: (responseText: string) => any;
  responseType?: R;

  timeout?: number;

  retry?: number | false;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

export type TFetchContext<T = any, R extends TResponseType = TResponseType> = {
  request: Request;
  options: TFetchOptions<R>;
  response?: TResponse<T>;
  error?: Error;
};

export type LowercaseFirstLetter<T extends string> = T extends `${infer FirstLetter}${infer Rest}`
  ? `${Lowercase<FirstLetter>}${Rest}`
  : T;