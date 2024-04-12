import { Type } from '@sinclair/typebox';
import { Model } from '../../core/model';
import { Fetcher } from '../logic/fetcher';
import { ReverseProxy } from '../logic/reverse-proxy';

export const { MBaseContext } = Model.export({
  name: 'BaseContext',
  schema: Type.Intersect([
    Type.Object({
      fetch: Type.Unsafe<Fetcher['fetch']>(Type.Any()),
    }),
    Type.Partial(
      Type.Object({
        baseUrl: Type.String(),
        reverseProxy: Type.Unsafe<ReverseProxy>(Type.Any()),
      })
    )
  ])
});