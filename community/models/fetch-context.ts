import { Type } from '@sinclair/typebox';
import { Model } from '../../core/model';
import type { TRequest } from './request';
import type { TResponse } from './response';

export interface TFetchOptions extends Omit<RequestInit, "body"> {
  baseURL?: string;
  body?: RequestInit["body"] | Record<string, any>;
  ignoreResponseError?: boolean;
  params?: Record<string, any>;
  query?: Record<string, any>;
  parseResponse?: (responseText: string) => any;
  // responseType?: R;

  timeout?: number;

  retry?: number | false;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

export type TFetchContext = {
  request: TRequest;
  options: TFetchOptions;
  response?: TResponse;
  error?: Error;
};

export const { MFetchContext } = Model.export({
  name: 'FetchContext',
  schema: Type.Unsafe<TFetchContext>(Type.Any()),
});