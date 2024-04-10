import type { TSchema } from '@sinclair/typebox';
import { FeatureAdapter, type TFeatureAdapterExecutionPayload } from './feature-adapter';
import type { TFeatureAdapterOptions } from './feature-contract';

export type TFeatureAdapters<Host extends string> = Record<string, FeatureAdapter<Host, any, any, any, any>>;

export type TServiceOptions<Host extends string, FeatureAdapters extends TFeatureAdapters<any>> = {
  host: Host;
  adapters?: (self: Service<any, any>) => FeatureAdapters;
}

export class Service<Host extends string, FeatureAdapters extends TFeatureAdapters<any>> {
  host: Host;
  adapters: FeatureAdapters;

  constructor(public options: TServiceOptions<Host, FeatureAdapters>) {
    this.host = options.host;
    this.adapters = options.adapters ? options.adapters(new Service({ host: this.host })) : {} as FeatureAdapters;

    for (const name in this.adapters) {
      const adapter = this.adapters[name];
      if (adapter.host !== this.host) {
        const newAdapter = adapter.clone();
        newAdapter.host = this.host;
        this.adapters[name] = newAdapter as any;
      }
    }
  }

  createAdapter<Name extends string, Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Host extends string>(options: Omit<TFeatureAdapterOptions<Name, Input, Output, Ctx, Host>, 'host'>) {
    return new FeatureAdapter({
      ...options,
      host: this.host
    });
  }

  exportAdapter<Name extends string, InputSchema extends TSchema, OutputSchema extends TSchema, CtxSchema extends TSchema, Host extends string>(options: Omit<TFeatureAdapterOptions<Name, InputSchema, OutputSchema, CtxSchema, Host>, 'host'>) {
    return this.createAdapter(options).export();
  }

  export(): { [K in Host]: typeof this } {
    return { [this.host]: this } as { [K in Host]: typeof this };
  }

  static create<Host extends string, FeatureAdapters extends TFeatureAdapters<any>>(options: TServiceOptions<Host, FeatureAdapters>) {
    return new Service(options);
  }

  static export<Host extends string, FeatureAdapters extends TFeatureAdapters<any>>(options: TServiceOptions<Host, FeatureAdapters>) {
    return Service.create(options).export();
  }

  async execute<Name extends keyof FeatureAdapters, Input extends FeatureAdapters[Name]['contract']['input'], Ctx extends FeatureAdapters[Name]['contract']['ctx']>(payload: Omit<TFeatureAdapterExecutionPayload<Name, Host, Input, Ctx>, 'host'>) {
    return this.adapters[payload.name].execute(payload);
  }
};