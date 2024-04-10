import { Type } from '@sinclair/typebox';
import { Headers } from 'undici';
import { Model, type ModelType } from '../../core/model';

export const { MResponseBody } = Model.export({
  name: 'ResponseBody',
  schema: Type.Union([
    Type.Null(),
    Type.Unsafe<Blob>(Type.Any()),
    Type.Unsafe<string>(Type.Any()),
    Type.Unsafe<ArrayBuffer>(Type.Any()),
    Type.Unsafe<ReadableStream<Uint8Array>>(Type.Any()),
  ])
});

export type TResponseBody = ModelType<typeof MResponseBody>;

export interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type TResponseType = keyof ResponseMap | "json";

export const { MResponse } = Model.export({
  name: 'Response',
  schema: Type.Intersect([
    Type.Object({
      url: Type.String(),
      headers: Type.Unsafe<Headers>(Type.Any()),
      body: MResponseBody.schema,
      status: Type.Number(),
      statusText: Type.String(),
    }),
    Type.Partial(
      Type.Object({
        data: Type.Unknown(),
      })
    )
  ])
});

export type TResponse = ModelType<typeof MResponse>;

// export const ResponseType = Model.create({
//   name: 'ResponseType',
//   schema: Type.Union([
//     Type.Literal('basic'),
//     Type.Literal('cors'),
//     Type.Literal('default'),
//     Type.Literal('error'),
//     Type.Literal('opaque'),
//     Type.Literal('opaqueredirect'),
//   ])
// })

// export const Response = Model.create({
//   name: 'Response',
//   schema: Type.Object({
//     // headers: Type.Ref(Headers),
//     ok: Type.Boolean(),
//     status: Type.Number(),
//     statusText: Type.String(),
//     type: ResponseType.schema,
//     url: Type.String(),
//     redirected: Type.Boolean(),
//     body: Type.Any(),
//     // body: Type.Union([Type.Ref(ReadableStream), Type.Null()]),
//     bodyUsed: Type.Boolean(),
//     arrayBuffer: Type.Function([], Type.Promise(Type.Any())),
//     blob: Type.Function([], Type.Promise(Type.Any())),
//     formData: Type.Function([], Type.Promise(Type.Any())),
//     json: Type.Function([], Type.Promise(Type.Unknown())),
//     text: Type.Function([], Type.Promise(Type.String())),
//     // clone: Type.Function([Type.Return(Type.Ref(Response))]),
//   })
// })