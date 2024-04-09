import { type Static, type TSchema } from '@sinclair/typebox';

export class Model<S extends TSchema, O extends Static<S>, C extends any> {
  ref: string;
  schema: S;
  use: (data?: Static<S>) => C;
  extend: (data: Static<S>) => O;

  constructor(model: {
    ref: string;
    schema: S;
    use?: (data: Static<S>) => C;
    extend?: (data: Static<S>) => O;
  }) {
    this.ref = model.ref;
    this.schema = model.schema;
    this.schema.$id = this.ref;
    this.use = model.use?.bind(this) || ((data: any) => data);
    this.extend = model.extend?.bind(this) || (() => ({} as O));
  }

  static create<S extends TSchema, O extends Static<S>, C extends any>(model: {
    ref: string;
    schema: S;
    use?: (data: Static<S>) => C;
    extend?: (data: Static<S>) => O;
  }) {
    return new Model<S, O, C>(model);
  }

  // type accessors
  get __type(): Static<S> {
    return null as any;
  }

  get __defined(): O {
    return null as any;
  }
}