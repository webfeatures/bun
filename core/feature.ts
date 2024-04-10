import { type TSchema } from '@sinclair/typebox';
import { FeatureAdapter } from './feature-adapter';
import { FeatureContract, type FeatureAdapterHandler, type TFeatureAdapterOptions, type TFeatureContractOptions } from './feature-contract';
export { Type } from '@sinclair/typebox';

export class Feature {
  static createContract<Name extends string, InputSchema extends TSchema, OutputSchema extends TSchema, CtxSchema extends TSchema>(options: TFeatureContractOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    return new FeatureContract(options);
  }

  static exportContract<Name extends string, InputSchema extends TSchema, OutputSchema extends TSchema, CtxSchema extends TSchema>(options: TFeatureContractOptions<Name, InputSchema, OutputSchema, CtxSchema>) {
    return new FeatureContract(options).export();
  }

  static createAdapter<Host extends string, Name extends string, InputSchema extends TSchema, OutputSchema extends TSchema, CtxSchema extends TSchema>(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>) {
    return new FeatureAdapter(options);
  }

  static exportAdapter<Host extends string, Name extends string, InputSchema extends TSchema, OutputSchema extends TSchema, CtxSchema extends TSchema>(options: TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>) {
    return new FeatureAdapter(options).export();
  }

  static defineHandler<FC extends FeatureContract<any, any, any, any>>(_contract: FC, handler: FeatureAdapterHandler<FC>) {
    return handler;
  }
}