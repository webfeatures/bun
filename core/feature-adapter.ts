import type { Static, TSchema } from '@sinclair/typebox';
import type { LowercaseFirstLetter } from '../community/types';
import { FeatureContract, type TFeatureAdapterHandler } from './feature-contract';
import type { Model, ModelType } from './model';

export type TFeatureAdapterExecutionPayload<Name extends unknown, Host extends unknown, Input extends Model, Output extends Model, Ctx extends Model> = {
  name: Name;
  host: Host;
  input: ModelType<Input>;
  output?: ModelType<Output>;
} & ModelType<Ctx>;

export type TFeatureAdapterOptions<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema> = {
    contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>;
    handler: TFeatureAdapterHandler<InputSchema, OutputSchema, CtxSchema>;
    samples?: Static<InputSchema>[];
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
  handler: TFeatureAdapterHandler<InputSchema, OutputSchema, CtxSchema>;
  samples: Static<InputSchema>[];

  constructor(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    this.contract = options.contract;
    this.handler = options.handler;
    this.samples = options?.samples || [];
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

  async test(ctx?: ModelType<Ctx>, samples: Static<InputSchema>[] = this.samples) {
    for (const sample of samples) {
      try {
        // Have to force ctx to be of type Ctx because of the way the FeatureAdapter is defined
        const result = await this.execute({ ...ctx, input: sample } as any);
        await this.contract.testFn({ ...ctx, ...result, input: sample, });
      } catch (error) {
        throw new Error(`FeatureContract ${this.contract.name} failed test: ${error}`);
      }
    }
  }

  asNamedExport(): { [K in LowercaseFirstLetter<Name>]: typeof this } {
    const lowercasedFirstLetter = this.contract.name.charAt(0).toLowerCase() + this.contract.name.slice(1);
    return { [lowercasedFirstLetter]: this } as { [K in LowercaseFirstLetter<Name>]: typeof this };
  }

  async execute(payload: Omit<TFeatureAdapterExecutionPayload<Name, unknown, Input, Output, Ctx>, 'name' | 'host'>): Promise<{ input: Static<InputSchema>, output: Static<OutputSchema>, errors: any[] }> {
    let { input: payloadInput, output: payloadOutput, ...payloadCtx } = payload;
    const input = Object.freeze(this.contract.input.parse(payloadInput)) as ModelType<Input>;
    let output = this.contract.output.parse(payloadOutput) as ModelType<Output>;
    const ctx = this.contract.ctx.parse(payloadCtx) as ModelType<Ctx>;
    const arg = { ...ctx, input, output };

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