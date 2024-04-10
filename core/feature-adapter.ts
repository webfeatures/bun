import type { Static, TSchema, TUndefined, TVoid } from '@sinclair/typebox';
import type { LowercaseFirstLetter } from '../community/types';
import { FeatureContract, type TFeatureAdapterHandler, type TFeatureAdapterOptions } from './feature-contract';
import type { Model, ModelSchema, ModelType } from './model';

export type TFeatureAdapterExecutionPayload<Name extends unknown, Host extends unknown, Input extends Model, Ctx extends Model> = {
  name: Name;
  host: Host;
  input: ModelType<Input>;
} & (ModelSchema<Ctx> extends (TVoid | TUndefined) ? {} : { ctx: ModelType<Ctx> });


export class FeatureAdapter<
  Host extends (string | ''),
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema,
  Input extends Model<any, any, any> = Model<`${Name}Input`, InputSchema>,
  Output extends Model<any, any, any> = Model<`${Name}Output`, OutputSchema>,
  Ctx extends Model<any, any, any> = Model<`${Name}Ctx`, CtxSchema>
> {
  host: Host;
  contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>;
  handler: TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>;

  constructor(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>) {
    this.host = (options.host || '') as Host;
    this.contract = options.contract;
    this.handler = options.handler;
  }

  static create<
    Host extends string,
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>) {
    return new FeatureAdapter(options);
  }

  export(): { [K in LowercaseFirstLetter<Name>]: typeof this } {
    const lowercasedFirstLetter = this.contract.name.charAt(0).toLowerCase() + this.contract.name.slice(1);
    return { [lowercasedFirstLetter]: this } as { [K in LowercaseFirstLetter<Name>]: typeof this };
  }

  clone(): FeatureAdapter<Host, Name, InputSchema, OutputSchema, CtxSchema, Input, Output, Ctx> {
    return new FeatureAdapter({
      host: this.host,
      contract: this.contract,
      handler: this.handler,
    });
  }

  static export<
    Host extends string,
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>) {
    const instance = new FeatureAdapter(options);
    return instance.export();
  }

  async execute(payload: Omit<TFeatureAdapterExecutionPayload<Name, unknown, Input, Ctx>, 'name' | 'host'>): Promise<{ input: Static<InputSchema>, output: Static<OutputSchema>, errors: any[] }> {
    const input = this.contract.input.parse(payload.input) as ModelType<Input>;
    let output = this.contract.output.create() as ModelType<Output>;
    const ctx = ('ctx' in payload ? this.contract.ctx.parse(payload.ctx) : undefined) as ModelType<Ctx>;
    let arg = { input, output, ctx };

    try {
      await this.handler(arg);
    } catch (error) {
      console.error(error);
    }

    const outputModel = this.contract.output;

    const isOutputOk = outputModel.validate(arg.output);
    const errors = !isOutputOk ? outputModel.errors(arg.output) : [];
    const parsedOutput = outputModel.parse(arg.output);

    return {
      input,
      output: parsedOutput,
      errors,
    } as { input: Static<InputSchema>, output: Static<OutputSchema>, errors: any[] };
  }
}