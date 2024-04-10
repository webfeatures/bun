import { Type } from '@sinclair/typebox';
import { Model } from '../../core/model';

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
  TRACE = "TRACE",
};

export const { MHttpMethod } = Model.export({
  name: 'HttpMethod',
  schema: Type.Enum(HttpMethod),
});