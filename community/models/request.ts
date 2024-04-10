import { Type } from '@sinclair/typebox';
import { Model, type ModelType } from '../../core/model';
import { HttpMethod } from './http-method';

// export type TRequest = Request & RequestInit;
export const { MRequest } = Model.export({
  name: 'Request',
  schema: Type.Intersect([
    Type.Object({
      url: Type.String(),
    }),
    Type.Partial(
      Type.Object({
        method: Type.Enum(HttpMethod, { default: HttpMethod.GET }),
        headers: Type.Object({}),
        body: Type.Any(),
      })
    )
  ]),
});

export type TRequest = ModelType<typeof MRequest>;

// export const Request = Model.create({
//   name: 'Request',
//   schema: Type.Object({
//     cache: Type.Union([
//       Type.Literal('default'),
//       Type.Literal('no-store'),
//       Type.Literal('reload'),
//       Type.Literal('no-cache'),
//       Type.Literal('force-cache'),
//       Type.Literal('only-if-cached')
//     ]),
//     credentials: Type.Union([
//       Type.Literal('omit'),
//       Type.Literal('same-origin'),
//       Type.Literal('include')
//     ]),
//     destination: Type.Union([
//       Type.Literal(''),
//       Type.Literal('audio'),
//       Type.Literal('audioworklet'),
//       Type.Literal('document'),
//       Type.Literal('embed'),
//       Type.Literal('font'),
//       Type.Literal('frame'),
//       Type.Literal('iframe'),
//       Type.Literal('image'),
//       Type.Literal('manifest'),
//       Type.Literal('object'),
//       Type.Literal('paintworklet'),
//       Type.Literal('report'),
//       Type.Literal('script'),
//       Type.Literal('sharedworker'),
//       Type.Literal('style'),
//       Type.Literal('track'),
//       Type.Literal('video'),
//       Type.Literal('worker'),
//       Type.Literal('xslt')
//     ]),
//     headers: Type.Any(), // assuming `Headers` type is defined elsewhere
//     integrity: Type.String(),
//     method: Type.String(),
//     mode: Type.Union([
//       Type.Literal('same-origin'),
//       Type.Literal('no-cors'),
//       Type.Literal('cors'),
//       Type.Literal('navigate'),
//       Type.Literal('websocket')
//     ]),
//     redirect: Type.Union([
//       Type.Literal('follow'),
//       Type.Literal('error'),
//       Type.Literal('manual')
//     ]),
//     referrerPolicy: Type.String(),
//     url: Type.String(),
//     keepalive: Type.Boolean(),

//     signal: Type.Any(), // assuming `AbortSignal` type is defined elsewhere
//     // duplex: Type.Union([
//     //   Type.Literal('half'),
//     //   Type.Literal('full')
//     // ]),

//     body: Type.Union([Type.Any(), Type.Null()]), // assuming `ReadableStream` type is defined elsewhere
//     bodyUsed: Type.Boolean(),

//     arrayBuffer: Type.Function([], Type.Promise(Type.Any())), // assuming `ArrayBuffer` type is defined elsewhere
//     blob: Type.Function([], Type.Promise(Type.Any())), // assuming `Blob` type is defined elsewhere
//     formData: Type.Function([], Type.Promise(Type.Any())), // assuming `FormData` type is defined elsewhere
//     json: Type.Function([], Type.Promise(Type.Unknown())),
//     text: Type.Function([], Type.Promise(Type.String())),
//   })
// })