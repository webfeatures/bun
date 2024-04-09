import { type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { LowercaseFirstLetter } from '../types';
export { Type } from '@sinclair/typebox';

export type TFeatureExecutionPaylod<Name extends unknown, Host extends unknown, Input extends TSchema> = {
  name: Name;
  host: Host;
  input: Static<Input>;
}

export type TFeatureOptions<
  Input extends TSchema,
  Output extends TSchema,
  Ctx extends TSchema,
  Name extends string> = {
    name: Name,
    input: Input,
    output: Output,
    ctx: Ctx
  }

export type TFeatureInstanceHandler<
  Input extends TSchema,
  Output extends TSchema,
  Ctx extends TSchema> = (arg: {
    input: Static<Input>,
    output: Static<Output>,
    ctx: Static<Ctx>
  }) => Promise<void>;

export type TFeatureInstanceOptions<
  Input extends TSchema,
  Output extends TSchema,
  Ctx extends TSchema,
  Name extends string,
  Host extends string> = {
    host: Host;
    feature: Feature<Input, Output, Ctx, Name>;
    handler: TFeatureInstanceHandler<Input, Output, Ctx>;
  }

export class Feature<Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Name extends string = string> {
  name: Name;
  input: Input;
  output: Output;
  ctx: Ctx;

  constructor(options: TFeatureOptions<Input, Output, Ctx, Name>) {
    this.name = options.name;
    this.input = options.input;
    this.output = options.output;
    this.ctx = options.ctx;
  }

  static create<
    Input extends TSchema,
    Output extends TSchema,
    Ctx extends TSchema,
    Name extends string>(options: { name: Name } & Omit<TFeatureOptions<Input, Output, Ctx, Name>, 'name'>) {
    return new Feature(options);
  }

  export(): { [K in Name]: typeof this } {
    return { [this.name]: this } as { [K in Name]: typeof this };
  }

  static export<
    Input extends TSchema,
    Output extends TSchema,
    Ctx extends TSchema,
    Name extends string>(options: TFeatureOptions<Input, Output, Ctx, Name>) {
    const feature = new Feature(options);
    return feature.export();
  }

  createInstance<Host extends string>(options: Omit<TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>, 'feature'>) {
    return new FeatureInstance({
      ...options,
      feature: this,
    });
  }

  exportInstance<Host extends string>(options: Omit<TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>, 'feature'>) {
    const instance = this.createInstance(options);
    return instance.export();
  }
}


export class FeatureInstance<Input extends TSchema,
  Output extends TSchema,
  Ctx extends TSchema,
  Name extends string,
  Host extends string> {
  host: Host;
  feature: Feature<Input, Output, Ctx>;
  handler: TFeatureInstanceHandler<Input, Output, Ctx>;

  constructor(options: TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>) {
    this.host = options.host;
    this.feature = options.feature;
    this.handler = options.handler;
  }

  static create<Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Name extends string, Host extends string>(options: TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>) {
    return new FeatureInstance(options);
  }

  export(): { [K in Name]: typeof this } {
    return { [this.feature.name]: this } as { [K in Name]: typeof this };
  }

  static export<Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Name extends string, Host extends string>(options: TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>) {
    const instance = new FeatureInstance(options);
    return instance.export();
  }

  async execute(payload: Omit<TFeatureExecutionPaylod<Name, unknown, Input>, 'name' | 'host'>) {
    const input = Value.Cast(this.feature.input, payload.input);
    let output = Value.Create(this.feature.output);
    const ctx = Value.Create(this.feature.ctx);
    const arg = { input, output, ctx };

    try {
      await this.handler(arg);
    } catch (error) {
      console.error(error);
    }

    const isOutputOk = Value.Check(this.feature.output, arg.output);
    const errors = !isOutputOk ? Value.Errors(this.feature.output, arg.output) : [];
    const cleanOutput = Value.Clean(this.feature.output, arg.output);

    return {
      input,
      output: cleanOutput,
      errors,
    }
  }
}