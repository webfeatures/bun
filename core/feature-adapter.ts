import type { Static, TSchema, TUndefined, TVoid } from '@sinclair/typebox';
import type { LowercaseFirstLetter } from '../community/types';
import { FeatureContract, type TFeatureAdapterHandler } from './feature-contract';
import type { Model, ModelSchema, ModelType } from './model';

export type TFeatureAdapterExecutionPayload<Name extends unknown, Host extends unknown, Input extends Model, Ctx extends Model> = {
  name: Name;
  host: Host;
  input: ModelType<Input>;
} & (ModelSchema<Ctx> extends (TVoid | TUndefined) ? {} : { ctx: ModelType<Ctx> });

export type TFeatureAdapterOptions<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema> = {
    contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>;
    handler: TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>;
  }

export class FeatureAdapter<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema,
  Input extends Model<any, any, any> = Model<`${Name}Input`, InputSchema>,
  Output extends Model<any, any, any> = Model<`${Name}Output`, OutputSchema>,
  Ctx extends Model<any, any, any> = Model<`${Name}Ctx`, CtxSchema>
> {
  contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>;
  handler: TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>;

  constructor(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    this.contract = options.contract;
    this.handler = options.handler;
  }

  static for<
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>) {
    return {
      create(options: Omit<TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema>, 'contract'>) {
        return new FeatureAdapter({ contract, ...options });
      }
    }
  }

  static create<
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    return new FeatureAdapter(options);
  }

  static createNamedExport<
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    return new FeatureAdapter(options).asNamedExport();
  }

  asNamedExport(): { [K in LowercaseFirstLetter<Name>]: typeof this } {
    const lowercasedFirstLetter = this.contract.name.charAt(0).toLowerCase() + this.contract.name.slice(1);
    return { [lowercasedFirstLetter]: this } as { [K in LowercaseFirstLetter<Name>]: typeof this };
  }

  clone(): FeatureAdapter<Name, InputSchema, OutputSchema, CtxSchema, Input, Output, Ctx> {
    return new FeatureAdapter({
      contract: this.contract,
      handler: this.handler,
    });
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