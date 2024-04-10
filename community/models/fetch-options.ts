import { Type } from '@sinclair/typebox';
import { Model } from '../../core/model';

export const { MFetchOptions } = Model.export({
  name: 'FetchOptions',
  schema: Type.Unsafe<RequestInit>(Type.Any()),
})

export const {} = Model.export({
  name: 'FetchContext',
  schema: Type.Object({}),
});