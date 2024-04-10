import { type TSchema } from '@sinclair/typebox';
import { Model, type ModelType } from './model';
export { Type } from '@sinclair/typebox';

export type TFeatureContractOptions<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema> = {
    name: Name,
    input: InputSchema,
    output: OutputSchema,
    ctx: CtxSchema
  }

export type TFeatureAdapterHandler<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema,
  Input = Model<`${Name}Input`, InputSchema>,
  Output = Model<`${Name}Output`, OutputSchema>,
  Ctx = Model<`${Name}Ctx`, CtxSchema>> = (arg: {
    input: ModelType<Input>,
    output: ModelType<Output>,
    ctx: ModelType<Ctx>
  }) => Promise<void>;

export type TFeatureAdapterOptions<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema,
  Host extends string> = {
    host?: Host;
    contract: FeatureContract<Name, InputSchema, OutputSchema, CtxSchema>;
    handler: TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>;
  }


export type FeatureAdapterHandler<T> = T extends FeatureContract<infer Name, infer InputSchema, infer OutputSchema, infer CtxSchema> ? TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema> : never;

export type FeatureAdapterHandlerArg<T> = T extends FeatureContract<infer Name, infer InputSchema, infer OutputSchema, infer CtxSchema> ? Parameters<TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>>[0] : never;

export class FeatureContract<
  Name extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  CtxSchema extends TSchema,
  Input extends Model<any, any, any> = Model<`${Name}Input`, InputSchema>,
  Output extends Model<any, any, any> = Model<`${Name}Output`, OutputSchema>,
  Ctx extends Model<any, any, any> = Model<`${Name}Ctx`, CtxSchema>
> {
  name: Name;
  input: Input;
  output: Output;
  ctx: Ctx;

  constructor(options: TFeatureContractOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    this.name = options.name;
    this.input = Model.create({ name: `${this.name}Input`, schema: options.input }) as Input;
    this.output = Model.create({ name: `${this.name}Output`, schema: options.output }) as Output;
    this.ctx = Model.create({ name: `${this.name}Ctx`, schema: options.ctx }) as Ctx;
  }

  defineHandlerArg(arg: Parameters<TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>>[0]) {
    return arg;
  }

  defineHandler(handler: TFeatureAdapterHandler<Name, InputSchema, OutputSchema, CtxSchema>) {
    return handler;
  }

  static create<
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: { name: Name } & Omit<TFeatureContractOptions<Name, InputSchema, OutputSchema, CtxSchema>, 'name'>) {
    return new FeatureContract(options);
  }

  export(): { [K in Name]: typeof this } {
    return { [this.name]: this } as { [K in Name]: typeof this };
  }

  static export<
    Name extends string,
    InputSchema extends TSchema,
    OutputSchema extends TSchema,
    CtxSchema extends TSchema
  >(options: TFeatureContractOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    const feature = new FeatureContract(options);
    return feature.export();
  }
}
