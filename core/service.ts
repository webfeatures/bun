import { FeatureAdapter, type TFeatureAdapterExecutionPayload } from './feature-adapter';

export type TFeatureAdapters = Record<string, FeatureAdapter<any, any, any, any>>;

export type TServiceOptions<Host extends string, FeatureAdapters extends TFeatureAdapters> = {
  host: Host;
  adapters: FeatureAdapters;
}

export class Service<Host extends string, FeatureAdapters extends TFeatureAdapters> {
  host: Host;
  adapters: FeatureAdapters;

  constructor(public options: TServiceOptions<Host, FeatureAdapters>) {
    this.host = options.host;
    this.adapters = options.adapters;
  }

  names<Name extends keyof FeatureAdapters>() {
    return Object.keys(this.adapters) as Name[];
  }

  adapter<Name extends keyof FeatureAdapters>(name: Name): FeatureAdapters[Name] | never {
    if (!this.adapters[name]) throw new Error(`Adapter ${name as string} not found`);
    return this.adapters[name];
  }

  static create<Host extends string, FeatureAdapters extends TFeatureAdapters>(options: TServiceOptions<Host, FeatureAdapters>) {
    return new Service(options);
  }

  static createNamedExport<Host extends string, FeatureAdapters extends TFeatureAdapters>(options: TServiceOptions<Host, FeatureAdapters>) {
    return Service.create(options).asNamedExport();
  }

  asNamedExport(): { [K in Host]: typeof this } {
    return { [this.host]: this } as { [K in Host]: typeof this };
  }

  async execute<Name extends keyof FeatureAdapters, Input extends FeatureAdapters[Name]['contract']['input'], Ctx extends FeatureAdapters[Name]['contract']['ctx']>(payload: Omit<TFeatureAdapterExecutionPayload<Name, Host, Input, Ctx>, 'host'>) {
    return this.adapters[payload.name].execute(payload);
  }
};